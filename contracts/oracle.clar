;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_PRICE (err u101))
(define-constant ERR_INVALID_INTERVAL (err u102))
(define-constant MIN_UPDATE_INTERVAL u1)
(define-constant MAX_UPDATE_INTERVAL u1440) ;; Max 10 days (assuming 1 block per 10 minutes)

;; Data vars
(define-data-var stx-price uint u0)
(define-data-var last-update uint u0)
(define-data-var update-interval uint u144) ;; ~1 day (assuming 1 block per 10 minutes)