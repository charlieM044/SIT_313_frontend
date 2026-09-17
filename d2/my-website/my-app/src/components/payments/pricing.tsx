import { useMemo, useState, type SyntheticEvent, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import plansData from '../data/plans.json' with { type: 'json' };

type PlanType = 'free' | 'paid' | 'premium';

type Plan = {  // Define the structure of a Plan object, which includes the type of plan, title, price, tagline, and a list of features.
  type: PlanType;
  title: string;
  price: string;
  tagline: string;
  features: string[];
};

type PaymentDetails = { // Define the structure of PaymentDetails, which includes the cardholder's name, card number, expiry date, and CVC code.
  name: string;
  cardNumber: string;
  expiry: string; 
  cvc: string;
};

const PLANS = plansData as Plan[];
const PLANS_PER_PAGE = 2;



function PaymentModal({
  plan,
  onClose,
  onSuccess,  // Define the PaymentModal component, which takes in a plan, onClose callback, and onSuccess callback as props. It manages the state of payment details, error messages, and submission status.
}: {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void; // The onSuccess callback is called when the payment is successfully processed, allowing the parent component to update its state accordingly.
}) {
  const { upgradePlan } = useAuth();  // Use the upgradePlan function from the AuthContext to handle the plan upgrade process.
  const [details, setDetails] = useState<PaymentDetails>({ // Initialize the payment details state with empty strings for name, card number, expiry date, and CVC code.
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });
  const [error, setError] = useState(''); // Initialize the error state to an empty string, which will be used to display any error messages related to payment processing.
  const [submitting, setSubmitting] = useState(false);  // Initialize the submitting state to false, which will be used to indicate whether the payment form is currently being submitted.


  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => { // Handle the form submission for the payment modal. It prevents the default form submission behavior, resets any existing error messages, and sets the submitting state to true.
    e.preventDefault();
    setError('');



    setSubmitting(true);
    try {
      await upgradePlan(details);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="payment-overlay" role="dialog" aria-modal="true" aria-labelledby="payment-title">
      <div className="payment-box">
        <h2 id="payment-title">Upgrade to {plan.title}</h2>
        <p className="payment-subtitle">{plan.price} &mdash; enter your card details below.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name on card"
            value={details.name}
            onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
            autoComplete="cc-name"
            required
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="Card number"
            value={details.cardNumber}
            onChange={(e) => setDetails((d) => ({ ...d, cardNumber: e.target.value }))}
            autoComplete="cc-number"
            required
          />
          <div className="payment-row">
            <input
              type="text"
              placeholder="MM/YY"
              value={details.expiry}
              onChange={(e) => setDetails((d) => ({ ...d, expiry: e.target.value }))}
              autoComplete="cc-exp"
              required
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="CVC"
              value={details.cvc}
              onChange={(e) => setDetails((d) => ({ ...d, cvc: e.target.value }))}
              autoComplete="cc-csc"
              required
            />
          </div>

          {error && <p className="form-status form-status--error">{error}</p>}

          <div className="payment-actions">
            <button type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Processing...' : `Pay & Upgrade`}
            </button>
          </div>
        </form>

      
      </div>
    </div>
  );
}



function Pricing() {
  const { isLoggedIn, planType, openLoginModal } = useAuth(); // Use the AuthContext to get the user's login status, current plan type, and a function to open the login modal if needed.

  const [visibleCount, setVisibleCount] = useState(PLANS_PER_PAGE);
  const [selectedType, setSelectedType] = useState<PlanType>(PLANS[0]?.type ?? 'free');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const currentPlan = useMemo( // Use useMemo to compute the current plan based on the user's plan type. This avoids unnecessary recalculations unless the planType changes.
    () => PLANS.find((plan) => plan.type === planType),
    [planType]
  );
  const selectedPlan = useMemo( // Use useMemo to compute the selected plan based on the selectedType state. This avoids unnecessary recalculations unless the selectedType changes.
    () => PLANS.find((plan) => plan.type === selectedType) ?? PLANS[0],
    [selectedType]
  );
  
  // Filter out current plan when logged in - only show upgrade options
  const plansToShow = useMemo(  // Use useMemo to compute the list of plans to show based on the user's login status and current plan type. 
  // //If the user is logged in and has a plan type, filter out that plan from the list of available plans. Otherwise, show all plans.
    () => isLoggedIn && planType 
      ? PLANS.filter((plan) => plan.type !== planType)
      : PLANS,
    [isLoggedIn, planType]
  );
  
  const visiblePlans = plansToShow.slice(0, visibleCount); // Use slice to get the currently visible plans based on the visibleCount state, which determines how many plans are displayed at once.

  // Anyone above 'free' is treated as an active paid tier for gating the
  // Upgrade button - only Free members (or logged-out visitors, once they
  // log in) should be able to activate it.
  const isOnFreePlan = !planType || planType === 'free';

  // Reset selectedType if it's the current plan (can't upgrade to current plan)
  useEffect(() => {
    if (isLoggedIn && planType && selectedType === planType) {
      const firstAvailablePlan = plansToShow[0];
      if (firstAvailablePlan) {
        setSelectedType(firstAvailablePlan.type);
      }
    }
  }, [isLoggedIn, planType, selectedType, plansToShow]);

  const handleUpgradeClick = () => { // Handle the click event for the "Upgrade Plan" button. It checks if the user is logged in and on a free plan before showing the payment modal. If the user is not logged in, it opens the login modal. If the user is already on a paid plan, it alerts them that they cannot upgrade.
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    if (!isOnFreePlan) { // If the user is not on a free plan, alert them that they are already on a paid plan and cannot upgrade further.
      alert(`You're already on the ${currentPlan?.title ?? 'Paid'} plan.`);
      return;
    }
    setUpgradeSuccess(false); 
    setShowPaymentModal(true); // Show the payment modal to allow the user to enter their payment details and upgrade their plan.
  };

  return (
    <section className="upgrade-section">
      <h1 className="upgrade-title">Pricing</h1>

      <p className="current-plan">
        Current Plan: {isLoggedIn ? (currentPlan?.title ?? 'Free') : 'Not logged in'}
        {isLoggedIn && planType === 'paid' && (
          <span className="plan-badge plan-badge--paid">Paid member</span>
        )}
      </p>

      <p className="upgrade-subtitle">Choose a plan to see what's included.</p>

      
      <div className="pricing-cards">
        {visiblePlans.map((plan) => (
          <button
            key={plan.type}
            type="button"
            className={`pricing-card ${selectedType === plan.type ? 'pricing-card--selected' : ''}`}
            aria-pressed={selectedType === plan.type}
            onClick={() => setSelectedType(plan.type)}
          >
            <h2>{plan.title}</h2>
            <p className="pricing-card-price">{plan.price}</p>
          </button>
        ))}
      </div>

      {visibleCount < plansToShow.length && (
        <button
          type="button"
          className="show-more-button"
          onClick={() => setVisibleCount((count) => count + PLANS_PER_PAGE)}
        >
          Show more plans
        </button>
      )}

      <div className="pricing-details">
        <h2>{selectedPlan.title} plan</h2>
        <p className="pricing-details-price">{selectedPlan.price}</p>
        <p className="pricing-details-tagline">{selectedPlan.tagline}</p>
        <ul className="pricing-features">
          {selectedPlan.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        <button
          type="button"
          className="upgrade-button"
          disabled={isLoggedIn && !isOnFreePlan}
          onClick={handleUpgradeClick}
        >
          Upgrade Plan
        </button>

        {upgradeSuccess && (
          <p className="form-status form-status--success">
            You're now on the Paid plan. Enjoy the extra features!
          </p>
        )}
      </div>

      {showPaymentModal && (
        <PaymentModal
          plan={PLANS.find((p) => p.type === 'paid') ?? selectedPlan}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            setUpgradeSuccess(true);
          }}
        />
      )}
    </section>
  );
}

export default Pricing;