;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_PROPOSAL (err u101))
(define-constant ERR_ALREADY_VOTED (err u102))
(define-constant ERR_PROPOSAL_ENDED (err u103))
(define-constant ERR_INSUFFICIENT_BALANCE (err u104))
(define-constant ERR_INVALID_INPUT (err u105))


;; Data vars
(define-data-var proposal-count uint u0)
(define-data-var min-proposal-stake uint u100000000) ;; 100 tokens
(define-data-var voting-period uint u1440) ;; ~10 days (assuming 1 block per 10 minutes)


;; Data maps
(define-map proposals
  uint
  {
    description: (string-ascii 256),
    proposer: principal,
    votes-for: uint,
    votes-against: uint,
    start-block: uint,
    end-block: uint,
    status: (string-ascii 20)
  }
)

(define-map user-votes { user: principal, proposal-id: uint } bool)
