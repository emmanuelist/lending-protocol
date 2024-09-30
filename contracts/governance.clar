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

;; SIP-010 trait definition
(define-trait ft-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    (get-balance (principal) (response uint uint))
  )
)

;; Helper functions
(define-private (transfer-tokens (token <ft-trait>) (amount uint) (sender principal) (recipient principal))
  (contract-call? token transfer amount sender recipient none))

;; Public functions
(define-public (create-proposal (description (string-ascii 256)) (token <ft-trait>))
  (let
    (
      (proposer tx-sender)
      (proposal-id (+ (var-get proposal-count) u1))
      (start-block block-height)
      (end-block (+ block-height (var-get voting-period)))
    )
    ;; Validate description length
    (asserts! (<= (len description) u256) ERR_INVALID_INPUT)
    (asserts! (>= (unwrap! (contract-call? token get-balance proposer) ERR_INSUFFICIENT_BALANCE)
                  (var-get min-proposal-stake))
              ERR_INSUFFICIENT_BALANCE)
    (try! (transfer-tokens token (var-get min-proposal-stake) proposer (as-contract tx-sender)))
    (map-set proposals proposal-id
      {
        description: description,
        proposer: proposer,
        votes-for: u0,
        votes-against: u0,
        start-block: start-block,
        end-block: end-block,
        status: "active"
      }
    )
    (var-set proposal-count proposal-id)
    (print "proposal-created")
    (ok proposal-id)
  )
)

(define-public (vote (proposal-id uint) (vote-for bool) (token <ft-trait>))
  (let
    (
      (sender tx-sender)
      (proposal (unwrap! (map-get? proposals proposal-id) ERR_INVALID_PROPOSAL))
    )
    (asserts! (is-eq (get status proposal) "active") ERR_PROPOSAL_ENDED)
    (asserts! (<= block-height (get end-block proposal)) ERR_PROPOSAL_ENDED)
    (asserts! (not (default-to false (map-get? user-votes { user: sender, proposal-id: proposal-id }))) ERR_ALREADY_VOTED)
    (asserts! (>= (unwrap! (contract-call? token get-balance sender) ERR_INSUFFICIENT_BALANCE) u1)
              ERR_INSUFFICIENT_BALANCE)
    (map-set user-votes { user: sender, proposal-id: proposal-id } true)
    (if vote-for
      (map-set proposals proposal-id (merge proposal { votes-for: (+ (get votes-for proposal) u1) }))
      (map-set proposals proposal-id (merge proposal { votes-against: (+ (get votes-against proposal) u1) }))
    )
    (print "vote-cast")
    (ok true)
  )
)

(define-public (end-proposal (proposal-id uint) (token <ft-trait>))
  (let
    (
      (proposal (unwrap! (map-get? proposals proposal-id) ERR_INVALID_PROPOSAL))
      (result (if (> (get votes-for proposal) (get votes-against proposal)) "passed" "rejected"))
    )
    (asserts! (> block-height (get end-block proposal)) ERR_PROPOSAL_ENDED)
    (asserts! (is-eq (get status proposal) "active") ERR_PROPOSAL_ENDED)
    ;; Validate token input
    (asserts! (is-eq (contract-call? token get-balance tx-sender) (ok u0)) ERR_INVALID_INPUT)
    (map-set proposals proposal-id (merge proposal { status: result }))
    (if (is-eq result "passed")
      (try! (as-contract (transfer-tokens token (var-get min-proposal-stake) tx-sender (get proposer proposal))))
      (try! (as-contract (transfer-tokens token (var-get min-proposal-stake) tx-sender CONTRACT_OWNER)))
    )
    (print "proposal-completed")
    (ok result)
  )
)
