#================================================#
#             Cue Similarity Analysis            #
#================================================#

rm(list = ls())
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
library(dplyr)
library(tidyr)
library(ggplot2)
library(corrplot)
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
  
  # --- typecast
  full$similarity = as.numeric(full$similarity)
  
  
  # --- Infer Durations
  format = "%Y-%m-%d %H:%M:%OS"
  full$rt = as.numeric(difftime(strptime(full$trial_end, format),
                              strptime(full$trial_start, format)),
                       units="secs") 
  meta$total_duration = as.numeric(difftime(strptime(meta$trial_end, format),
                                            strptime(meta$start, format)),
                                   units="secs") 
  
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
  min_total_duration = max(full$trial_num) # number of trials x 1s
  min_trial_duration = 0.5 # in seconds
  good_subjects = metadata$subject_id[metadata$total_duration >= min_total_duration]
  trials = trials[trials$subject_id %in% good_subjects,]
  trials = trials[trials$rt >= min_trial_duration,]
}


# ==== Main Analysis ===========================================================
# --- Reliability
sim_wide = trials %>% rowwise() %>% mutate(
  type = paste(min(stim_left, stim_right), max(stim_left, stim_right)),
  version = if (min(stim_left, stim_right) == stim_left) "LR" else "RL") %>%
  pivot_wider(
    id_cols = c(subject_id, type),
    names_from = version, 
    values_from = similarity
  ) %>% mutate(mean_sim = (LR+RL)/2)
tibble(sim_wide)

# r per participants -> "how precise is each participant's judgement"
retest_rel = sim_wide %>% group_by(subject_id) %>% summarize(cor=cor(LR, RL))

# median abs difference per pair -> "how stable is the judgement over participants"
# 1/sd per pair -> "how much did participants agree in their judgments"
sim_agg = sim_wide %>% group_by(type) %>% summarize(sim = median(mean_sim),
                                                    mad = median(abs(LR - RL)),
                                                    agree = 1/sd(mean_sim))

# --- Prepare Similarity Matrix
df2heatmat = function(sim_agg) {
  n_stim = length(unique(trials$stim_left))
  
  # init matrices
  sim_mat = matrix(0, n_stim, n_stim) + diag(100, n_stim, n_stim)
  mad_mat = matrix(0, n_stim, n_stim)
  agree_mat = matrix(0, n_stim, n_stim) + diag(1, n_stim, n_stim)
  
  # get matrix indices (starting at 1) per trial type
  idx = t(sapply(strsplit(sim_agg$type, ' '), as.integer) + 1)
  
  # helper function
  add2matrix = function(mat, i, val, center = F, range=c(0,1)){
    if (center) val = 2 * (val-mean(range))
    val_norm = val/(range[2]-range[1])
    mat[idx[i,1], idx[i,2]] = val_norm
    mat[idx[i,2], idx[i,1]] = val_norm
    return(mat)
  }
  
  # insert normalized values symmetrically into corresponding matrix
  for (i in 1:nrow(sim_agg)){
    sim_mat = add2matrix(sim_mat, i, sim_agg[i,]$sim)
    mad_mat = add2matrix(mad_mat, i, sim_agg[i,]$mad)
    agree_mat = add2matrix(agree_mat, i, sim_agg[i,]$agree)
  }
  
  return(list("sim_mat" = sim_mat, "mad_mat" = mad_mat, "agree_mat" = agree_mat))
}
matrices = df2heatmat(sim_agg)


# ==== Plots ===================================================================
# --- Heatmaps
corrplot(matrices$sim_mat,
         type = "upper",
         method = "color",
         is.corr = F, col.lim = c(0,100),
         cl.ratio = 0.2,
         tl.srt = 45,
         col = COL2("RdYlBu"),
         addgrid.col = "black",
         tl.pos = "d",
         tl.col = "white"
         )

corrplot(matrices$mad_mat,
         type = "upper",
         method = "color",
         is.corr = F, col.lim = c(0,100),
         cl.ratio = 0.2,
         tl.srt = 45,
         col = COL1("Reds"),
         addgrid.col = 'black',
         tl.pos = "d",
         tl.col = "white"
         )

corrplot(matrices$agree_mat,
         type = "upper",
         method = "color",
         is.corr = F, col.lim = c(0,1),
         cl.ratio = 0.2,
         tl.srt = 45,
         col = COL1("Greens"),
         addgrid.col = "black",
         # tl.pos = F,
         tl.pos = "d",
         tl.col = "white"
         )

# --- Test-Retest reliability
ggplot(data=retest_rel, aes(x=subject_id, y=cor, fill=subject_id))+
  geom_bar(stat="identity")+
  scale_y_continuous(expand = c(0, 0), breaks=seq(0,1,0.2), limits=c(0.0, 1.0))+
  scale_fill_brewer(palette="Set2")+
  ggtitle("Retest Reliability") +
  xlab("Subject ID") + ylab("Pearson's r") +
  theme_minimal()+
  theme(axis.line = element_line(colour = "black", size = 0.5, linetype = "solid"),
        axis.text = element_text(size=12),
        axis.text.x = element_text(vjust=-1),
        axis.title.x = element_text(margin = margin(t = 20)),
        axis.title.y = element_text(margin = margin(r = 20)),
        axis.title = element_text(size=14,face="bold"),
        plot.title = element_text(size=20,face="bold", margin = margin(b = 20), hjust = 0.5),
  ) + theme(legend.position="none")


