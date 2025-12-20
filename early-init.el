;; -*- lexical-binding: t; -*-

;; 延迟垃圾回收以加速启动
(setq gc-cons-threshold most-positive-fixnum)

;; Native compilation 设置
(setq native-comp-jit-compilation t)
(setq load-prefer-newer noninteractive)

;; 编码系统
(prefer-coding-system 'utf-8)

;; 禁止调整 frame 大小
(setq frame-inhibit-implied-resize t)

;; 禁用不必要的 UI 元素
(push '(menu-bar-lines . 0) default-frame-alist)
(push '(tool-bar-lines . 0) default-frame-alist)
(push '(vertical-scroll-bars) default-frame-alist)
(when (featurep 'ns)
  (push '(ns-transparent-titlebar . t) default-frame-alist))

(setq-default mode-line-format nil)

;; Windows 优化
(when (eq system-type 'windows-nt)
  (setq load-suffixes '(".elc" ".el"))
  (setq load-file-rep-suffixes '("")))

(provide 'early-init)
