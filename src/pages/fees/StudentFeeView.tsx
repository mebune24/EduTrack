import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, Smartphone, Banknote, Wallet, Loader2 } from 'lucide-react';
import type { FeeStructure, PaymentMethod, PaymentTransaction } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

function formatCFA(amount: number) {
  return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
}

const METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: React.ReactNode; color: string }> = {
  momo: { label: 'MTN Mobile Money', icon: <Smartphone className="w-5 h-5" />, color: 'bg-yellow-500' },
  orange_money: { label: 'Orange Money', icon: <Smartphone className="w-5 h-5" />, color: 'bg-orange-500' },
  card: { label: 'Debit/Credit Card', icon: <CreditCard className="w-5 h-5" />, color: 'bg-blue-500' },
  bank_transfer: { label: 'Bank Transfer', icon: <Banknote className="w-5 h-5" />, color: 'bg-green-600' },
};

export function StudentFeeView() {
  const { user } = useAuth();
  const [feeStructure, setFeeStructure] = useState<FeeStructure | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [phone, setPhone] = useState('');
  const [payStep, setPayStep] = useState<'select' | 'confirm' | 'processing' | 'success'>('select');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [paymentsSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, 'payments'), where('studentId', '==', user.id))),
          getDocs(query(collection(db, 'users'), where('__name__', '==', user.id))),
        ]);

        const txns: PaymentTransaction[] = [];
        paymentsSnap.forEach(doc => {
          txns.push({ id: doc.id, ...doc.data() } as PaymentTransaction);
        });
        setTransactions(txns);

        let userClassId: string | undefined;
        usersSnap.forEach(doc => {
          const data = doc.data();
          userClassId = data.classId;
        });

        if (userClassId) {
          const feeSnaps = await getDocs(collection(db, 'feeStructures'));
          let matched: FeeStructure | null = null;
          feeSnaps.forEach(doc => {
            const fee = { id: doc.id, ...doc.data() } as FeeStructure;
            if (fee.classId === userClassId) matched = fee;
          });
          setFeeStructure(matched);
        }
      } catch (err) {
        console.error("Error fetching fee data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const totalPaid = transactions.filter(t => t.status === 'confirmed').reduce((sum, t) => sum + t.amountPaid, 0);
  const totalFee = feeStructure?.totalAmount || 0;
  const balance = totalFee - totalPaid;

  const openPay = () => {
    setPayAmount(balance);
    setPayStep('select');
    setSelectedMethod(null);
    setPhone('');
    setShowPayModal(true);
  };

  const handlePay = async () => {
    setPayStep('processing');
    await new Promise(res => setTimeout(res, 1500));

    const newTxn: Omit<PaymentTransaction, 'id'> = {
      studentId: user?.id || 'demo',
      studentName: `${user?.firstName || 'Student'} ${user?.lastName || ''}`.trim(),
      feeStructureId: feeStructure.id,
      amountPaid: payAmount,
      method: selectedMethod!,
      status: 'confirmed',
      reference: `${selectedMethod?.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      paidAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    };

    try {
      const { addDoc, collection } = await import('firebase/firestore');
      const ref = await addDoc(collection(db, 'payments'), newTxn);
      setTransactions(prev => [...prev, { ...newTxn, id: ref.id }]);
      setPayStep('success');
    } catch (err) {
      console.error('Error recording payment:', err);
      setPayStep('select');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading fee details…</div>;
  if (!feeStructure) return <div className="p-8 text-center text-slate-500">No fee structure assigned yet.</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Fees & Payments</h1>
        <p className="text-slate-600">{feeStructure.academicYear} · {feeStructure.term} · {feeStructure.classId.toUpperCase()}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500 mb-1">Total Fee</p>
          <p className="text-2xl font-bold text-slate-800">{formatCFA(feeStructure.totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">{formatCFA(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500 mb-1">Outstanding Balance</p>
          <p className={`text-2xl font-bold ${balance <= 0 ? 'text-green-600' : balance < totalFee / 2 ? 'text-amber-600' : 'text-red-600'}`}>{formatCFA(Math.max(balance, 0))}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Fee Breakdown</h2>
            {balance > 0 && (
              <button
                onClick={openPay}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Wallet className="w-4 h-4" /> Pay Now
              </button>
            )}
            {balance <= 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Fully Paid
              </span>
            )}
          </div>
          <div className="p-4 divide-y divide-slate-50">
            {feeStructure.items.map(item => (
              <div key={item.id} className="flex justify-between py-3 text-sm">
                <span className="text-slate-700">{item.label}</span>
                <span className="font-medium text-slate-900">{formatCFA(item.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between py-3 font-bold text-sm">
              <span className="text-slate-800">Total</span>
              <span className="text-primary">{formatCFA(feeStructure.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4">
            <h2 className="font-bold text-slate-800">Payment History</h2>
          </div>
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No payments recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {transactions.map(txn => (
                <div key={txn.id} className="p-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-slate-800 text-sm">{formatCFA(txn.amountPaid)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        txn.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        txn.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{txn.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">{METHOD_CONFIG[txn.method].label}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{txn.reference}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    {new Date(txn.paidAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {payStep === 'success' ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Payment Confirmed!</h3>
                <p className="text-slate-500 mb-6">{formatCFA(payAmount)} received via {METHOD_CONFIG[selectedMethod!].label}.</p>
                <button onClick={() => setShowPayModal(false)} className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90">Done</button>
              </div>
            ) : payStep === 'processing' ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Processing Payment…</h3>
                <p className="text-slate-500">Please wait while we confirm your transaction.</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800">Make a Payment</h3>
                  <p className="text-sm text-slate-500">Outstanding balance: {formatCFA(balance)}</p>
                </div>
                <div className="p-6 space-y-5">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (XAF)</label>
                    <input
                      type="number"
                      min={1}
                      max={balance}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 focus:ring-primary focus:border-primary"
                      value={payAmount}
                      onChange={e => setPayAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Method selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.entries(METHOD_CONFIG) as [PaymentMethod, typeof METHOD_CONFIG[PaymentMethod]][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedMethod(key)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            selectedMethod === key
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-200 text-slate-600 hover:border-primary/40'
                          }`}
                        >
                          {cfg.icon}
                          <span className="leading-tight">{cfg.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phone / Reference if mobile money */}
                  {(selectedMethod === 'momo' || selectedMethod === 'orange_money') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. 650 000 000"
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                      <p className="text-xs text-slate-400 mt-1">A push notification will be sent to this number.</p>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                  <button onClick={() => setShowPayModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                  <button
                    onClick={handlePay}
                    disabled={!selectedMethod || payAmount <= 0}
                    className="px-5 py-2 bg-primary text-white text-sm rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    Confirm & Pay {formatCFA(payAmount)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
