;; lending-pool.clar

(use-trait ft-trait .sip-010-trait.sip-010-trait)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INSUFFICIENT_BALANCE (err u101))
(define-constant ERR_INSUFFICIENT_COLLATERAL (err u102))
(define-constant ERR_INVALID_AMOUNT (err u103))
(define-constant ERR_PAUSED (err u104))

;; Data vars
(define-data-var min-collateral-ratio uint u150) ;; 150% collateralization ratio
(define-data-var interest-rate uint u5) ;; 5% annual interest rate
(define-data-var total-deposits uint u0)
(define-data-var total-borrows uint u0)
(define-data-var paused bool false)

;; Data maps
(define-map user-deposits { user: principal } { amount: uint, last-update: uint })
(define-map user-borrows { user: principal } { amount: uint, last-update: uint })

;; SIP-009 NFT trait
(use-trait nft-trait .sip-009-trait.sip-009-trait)

;; Events
(define-public (deposit-event (user principal) (amount uint))
  (ok (print {event: "deposit", user: user, amount: amount})))

(define-public (withdraw-event (user principal) (amount uint))
  (ok (print {event: "withdraw", user: user, amount: amount})))

(define-public (borrow-event (user principal) (amount uint))
  (ok (print {event: "borrow", user: user, amount: amount})))

(define-public (repay-event (user principal) (amount uint))
  (ok (print {event: "repay", user: user, amount: amount})))

;; Public functions
(define-public (deposit (amount uint))
  (let 
    (
      (sender tx-sender)
      (current-deposit (default-to {amount: u0, last-update: u0} (map-get? user-deposits {user: sender})))
    )
    (asserts! (not (var-get paused)) ERR_PAUSED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (try! (stx-transfer? amount sender (as-contract tx-sender)))
    (map-set user-deposits 
      {user: sender} 
      {
        amount: (+ (get amount current-deposit) amount), 
        last-update: block-height
      }
    )
    (var-set total-deposits (+ (var-get total-deposits) amount))
    (try! (deposit-event sender amount))
    (ok amount)
  )
)

(define-public (withdraw (amount uint))
  (let
    (
      (sender tx-sender)
      (current-deposit (default-to {amount: u0, last-update: u0} (map-get? user-deposits {user: sender})))
      (current-borrow (default-to {amount: u0, last-update: u0} (map-get? user-borrows {user: sender})))
    )
    (asserts! (not (var-get paused)) ERR_PAUSED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (>= (get amount current-deposit) amount) ERR_INSUFFICIENT_BALANCE)
    (asserts! (is-ok (check-collateral-ratio sender (- (get amount current-deposit) amount) (get amount current-borrow))) ERR_INSUFFICIENT_COLLATERAL)
    (try! (as-contract (stx-transfer? amount tx-sender sender)))
    (map-set user-deposits 
      {user: sender} 
      {
        amount: (- (get amount current-deposit) amount), 
        last-update: block-height
      }
    )
    (var-set total-deposits (- (var-get total-deposits) amount))
    (try! (withdraw-event sender amount))
    (ok amount)
  )
)

(define-public (borrow (amount uint))
  (let
    (
      (sender tx-sender)
      (current-deposit (default-to {amount: u0, last-update: u0} (map-get? user-deposits {user: sender})))
      (current-borrow (default-to {amount: u0, last-update: u0} (map-get? user-borrows {user: sender})))
    )
    (asserts! (not (var-get paused)) ERR_PAUSED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-ok (check-collateral-ratio sender (get amount current-deposit) (+ (get amount current-borrow) amount))) ERR_INSUFFICIENT_COLLATERAL)
    (try! (as-contract (stx-transfer? amount tx-sender sender)))
    (map-set user-borrows 
      {user: sender} 
      {
        amount: (+ (get amount current-borrow) amount), 
        last-update: block-height
      }
    )
    (var-set total-borrows (+ (var-get total-borrows) amount))
    (try! (borrow-event sender amount))
    (ok amount)
  )
)

(define-public (repay (amount uint))
  (let
    (
      (sender tx-sender)
      (current-borrow (default-to {amount: u0, last-update: u0} (map-get? user-borrows {user: sender})))
    )
    (asserts! (not (var-get paused)) ERR_PAUSED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (>= (get amount current-borrow) amount) ERR_INSUFFICIENT_BALANCE)
    (try! (stx-transfer? amount sender (as-contract tx-sender)))
    (map-set user-borrows 
      {user: sender} 
      {
        amount: (- (get amount current-borrow) amount), 
        last-update: block-height
      }
    )
    (var-set total-borrows (- (var-get total-borrows) amount))
    (try! (repay-event sender amount))
    (ok amount)
  )
)

