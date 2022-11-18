#================================================#
#             Cue Similarity Analysis            #
#================================================#

# === Preprocessing ===
# --- Clean Up
rm(list = ls())
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# --- Load data
fnames = list.files(pattern = "data", recursive = T, full.names = T)
df = data.frame()
meta = data.frame()
for (fname in fnames){
  json_list = jsonlite::fromJSON(fname)
  tmp =  as.data.frame(do.call("cbind", json_list))
  df = dplyr::bind_rows(df, tmp)
  meta = dplyr::bind_rows(meta, tail(tmp, n = 1))
}

# --- Infer Durations
format = "%Y-%m-%d %H:%M:%OS"
df$rt = as.numeric(difftime(strptime(df$trial_end, format),
                            strptime(df$trial_start, format))) 
meta$duration = as.numeric(difftime(strptime(meta$trial_end, format),
                                    strptime(meta$start, format))) 

# --- Remove irrelevant info
trials = subset(df, select=c(subject_id, stim_left, stim_right, similarity, rt))
metadata = subset(meta, select=-c(
  start, stim_left, stim_right, similarity, trial_start, trial_end, end_time,
  survey_time))

# --- Discard trials / participants
# TODO min reaction time, min duration


# === Main Analysis ===
# --- Retest Reliability
# TODO

# --- Similarity Matrix
# TODO

# --- Plot Matrix
# TODO

# --- Plot metadata distribution
# TODO