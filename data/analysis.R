#================================================#
#             Cue Similarity Analysis            #
#================================================#

rm(list = ls())
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
library(dplyr)
library(tidyr)
load_raw = T
filter_trials = F

# ==== Preprocessing ===========================================================
if (load_raw) {
  # --- Load data
  fnames = list.files(pattern = "data", recursive = T, full.names = T)
  full = data.frame()
  meta = data.frame()
  for (fname in fnames){
    json_list = jsonlite::fromJSON(fname)
    tmp =  as.data.frame(do.call("cbind", json_list))
    tmp = cbind(trial_num = seq(1, nrow(tmp)), tmp)
    full = bind_rows(full, tmp)
    meta = bind_rows(meta, tail(tmp, n = 1))
  }
  
  # --- Infer Durations
  format = "%Y-%m-%d %H:%M:%OS"
  full$rt = as.numeric(difftime(strptime(full$trial_end, format),
                              strptime(full$trial_start, format))) 
  meta$total_duration = as.numeric(difftime(strptime(meta$trial_end, format),
                                      strptime(meta$start, format))) 
  
  # --- Remove irrelevant info
  trials = subset(full, select=c(
    trial_num, subject_id, stim_left, stim_right, similarity, rt))
  metadata = subset(meta, select=-c(
    start, stim_left, stim_right, similarity,
    trial_start, trial_end, end_time, survey_time))
  rm(json_list, tmp, meta)
  
  # --- Save aggregated data
  write.csv(trials,"./trials.csv", row.names = F)
  write.csv(metadata,"./participant_info.csv", row.names = F)
} else {
  # --- Load aggregated data
  trials = read.csv("./trials.csv")
  metadata = read.csv("./participant_info.csv")
}

# --- Discard trials / participants
if (filter_trials){
  min_total_duration = 10 # number of trials x 1s
  min_trial_duration = 0.5 # in seconds
  good_subjects = metadata$subject_id[metadata$total_duration >= min_total_duration]
  trials = trials[trials$subject_id %in% good_subjects,]
  trials = trials[trials$rt >= min_trial_duration,]
}


# ==== Main Analysis ===========================================================
# --- Retest Reliability
sim_wide = trials %>% rowwise() %>% mutate(type = paste(
  min(stim_left, stim_right), max(stim_left, stim_right)),
  version = if (min(stim_left, stim_right) == stim_left) "LR" else "RL") %>%
  pivot_wider(
    id_cols = c(subject_id, type),
    names_from = version, 
    values_from = similarity
  )

# --- Similarity Matrix
# TODO

# --- Plot Matrix
# TODO

# --- Plot metadata distribution
# TODO