;;; init.el --- Smart configuration loader -*- lexical-binding: t -*-
;;; Commentary:
;; 智能判断是否需要从 config.org 重新生成 config.el
;; 只有当 config.org 比 config.el 新时才重新生成

;;; Code:

;; 记录启动时间
(defvar my/emacs-load-start-time (current-time))

;; ==================== 包管理 ====================
(require 'package)
(setq package-archives '(("gnu"    . "https://mirrors.ustc.edu.cn/elpa/gnu/")
                         ("melpa"  . "https://mirrors.ustc.edu.cn/elpa/melpa/")
                         ("nongnu" . "https://mirrors.ustc.edu.cn/elpa/nongnu/")))

;; Bootstrap use-package
(unless (package-installed-p 'use-package)
  (package-refresh-contents)
  (package-install 'use-package))

;; ==================== 智能加载配置 ====================
(let* ((org-file (expand-file-name "config.org" user-emacs-directory))
       (el-file (expand-file-name "config.el" user-emacs-directory))
       (org-exists (file-exists-p org-file))
       (el-exists (file-exists-p el-file))
       (org-newer (and org-exists el-exists
                       (time-less-p (file-attribute-modification-time
                                     (file-attributes el-file))
                                    (file-attribute-modification-time
                                     (file-attributes org-file))))))

  (cond
   ;; 情况1: config.org 更新了，需要重新 tangle
   (org-newer
    (require 'org)
    (org-babel-load-file org-file))

   ;; 情况2: config.el 存在且是最新的，直接加载
   (el-exists
    (load-file el-file))

   ;; 情况3: 只有 config.org，首次生成
   (org-exists
    (require 'org)
    (org-babel-load-file org-file))))

;; ==================== 启动完成 ====================
(add-hook 'emacs-startup-hook
          (lambda ()
            (message "Emacs 启动完成，耗时 %.2f 秒，加载了 %d 个包"
                     (float-time (time-subtract (current-time)
                                                my/emacs-load-start-time))
                     (length package-activated-list))))

;;; init.el ends here
