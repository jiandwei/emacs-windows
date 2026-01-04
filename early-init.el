;; -*- lexical-binding: t; -*-
;;; early-init.el --- generated from init.org  -*- lexical-binding: t; -*-

;; ========== 1) GC 临时加速：启动期最大化，启动后恢复 ==========
(defvar my/startup-gc-cons-threshold gc-cons-threshold
  "GC threshold before startup optimization.")

(defvar my/startup-gc-cons-percentage gc-cons-percentage
  "GC percentage before startup optimization.")

(setq gc-cons-threshold most-positive-fixnum
      gc-cons-percentage 0.6)

;; 启动完成后恢复一个“偏大但不夸张”的阈值，避免运行期卡顿/内存膨胀
(add-hook 'emacs-startup-hook
          (lambda ()
            (setq gc-cons-threshold (max my/startup-gc-cons-threshold (* 64 1024 1024))
                  gc-cons-percentage my/startup-gc-cons-percentage)))

;; ========== 2) file-name-handler-alist 临时加速（对启动很关键） ==========
(defvar my/startup-file-name-handler-alist file-name-handler-alist
  "Saved `file-name-handler-alist' during startup.")

(setq file-name-handler-alist nil)

(add-hook 'emacs-startup-hook
          (lambda ()
            (setq file-name-handler-alist my/startup-file-name-handler-alist)))

;; ========== 3) Native compilation / load 策略 ==========
(setq load-prefer-newer t)

;; Emacs 28+ 默认就是 jit 异步 native comp；保留没问题
(setq native-comp-jit-compilation t)

;; 一般建议关掉 native comp 的警告刷屏（不是性能项，但减少启动噪音）
(setq native-comp-async-report-warnings-errors nil)

;; ========== 4) 编码（早期设置 OK） ==========
(prefer-coding-system 'utf-8)
(setq-default buffer-file-coding-system 'utf-8)

;; ========== 5) Frame/UI：放 early-init 合理（避免 first frame 闪烁） ==========
(setq frame-inhibit-implied-resize t)

(push '(menu-bar-lines . 0) default-frame-alist)
(push '(tool-bar-lines . 0) default-frame-alist)
(push '(vertical-scroll-bars . nil) default-frame-alist)
(setq load-suffixes '(".elc" ".el"))
(setq load-file-rep-suffixes '(""))

(provide 'early-init)
;;; early-init.el ends here
