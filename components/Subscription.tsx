
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockBackend } from '../services/mockBackend';
import { Plan, Subscription, Payment } from '../types';
import { CreditCard, Check, ShieldCheck, Clock, Receipt } from 'lucide-react';

const Subscription: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [p, s, h] = await Promise.all([
      mockBackend.billing.getPlans(),
      mockBackend.billing.getSubscription(user.id),
      mockBackend.billing.getPayments(user.id)
    ]);
    setPlans(p);
    setSubscription(s);
    setPayments(h);
    setLoading(false);
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    if (subscription?.planId === planId) return; // Already subscribed
    
    setProcessingId(planId);
    try {
      await mockBackend.billing.createSubscription(user.id, planId);
      await loadData();
    } catch (e) {
      alert("Payment failed. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading billing info...</div>;

  const currentPlan = plans.find(p => p.id === subscription?.planId) || plans.find(p => p.id === 'plan_free');

  return (
    <div className="pb-24 md:pb-0 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CreditCard size={32} className="text-rose-500" /> Subscription
          </h2>
          <p className="text-slate-500 mt-2">Manage your plan and billing details.</p>
        </div>
        
        {subscription && (
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl flex items-center gap-3">
             <ShieldCheck className="text-emerald-600" size={20} />
             <div>
                <p className="text-emerald-900 font-bold text-sm">Active Membership</p>
                <p className="text-emerald-700 text-xs">Renews on {new Date(subscription.endDate).toLocaleDateString()}</p>
             </div>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const isCurrent = currentPlan?.id === plan.id;
          const isProcessing = processingId === plan.id;

          return (
            <div 
              key={plan.id} 
              className={`relative bg-white rounded-3xl p-6 border-2 flex flex-col transition-all ${
                isCurrent ? 'border-rose-500 shadow-md ring-4 ring-rose-50' : 'border-slate-100 shadow-sm hover:border-rose-200'
              } ${plan.isFeatured ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {plan.isFeatured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                  <span className="text-slate-500">/{plan.interval}</span>
                </div>
                <p className="text-slate-500 text-sm mt-2">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="mt-0.5 bg-green-100 text-green-600 rounded-full p-0.5">
                      <Check size={10} strokeWidth={4} />
                    </div>
                    {feat}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || isProcessing}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  isCurrent 
                    ? 'bg-slate-100 text-slate-400 cursor-default' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl'
                }`}
              >
                {isCurrent ? 'Current Plan' : isProcessing ? 'Processing...' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
           <Receipt size={20} className="text-slate-400" />
           <h3 className="font-bold text-slate-900">Billing History</h3>
        </div>
        
        {payments.length === 0 ? (
           <div className="p-8 text-center text-slate-400 text-sm">No payment history available.</div>
        ) : (
           <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                 <tr>
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 pr-6">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                       <td className="p-4 pl-6 text-slate-500">{new Date(payment.date).toLocaleDateString()}</td>
                       <td className="p-4 font-medium text-slate-900">{payment.description}</td>
                       <td className="p-4 text-slate-600">${payment.amount.toFixed(2)}</td>
                       <td className="p-4 pr-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                             payment.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                             {payment.status}
                          </span>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        )}
      </div>
    </div>
  );
};

export default Subscription;
