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

;; Public functions
(define-public (set-stx-price (price uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (> price u0) ERR_INVALID_PRICE)
    (asserts! (or 
                (is-eq (var-get last-update) u0) 
                (>= (- block-height (var-get last-update)) (var-get update-interval))
              ) 
              ERR_UNAUTHORIZED)
    (var-set stx-price price)
    (var-set last-update block-height)
    (print {event: "price-updated", price: price})
    (ok price)))

	;; Read-only functions
(define-read-only (get-stx-price)
  (ok (var-get stx-price)))

(define-read-only (get-last-update)
  (ok (var-get last-update)))