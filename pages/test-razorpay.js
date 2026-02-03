import { useState, useEffect } from 'react';
import Script from 'next/script';

export default function TestRazorpay() {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [testResult, setTestResult] = useState('');

  const testPayment = async () => {
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1 }) // ₹1 test payment
      });
      
      const data = await res.json();
      
      if (data.id) {
        setTestResult('✅ Order creation successful: ' + data.id);
        
        if (window.Razorpay) {
          const options = {
            key: data.key,
            amount: data.amount,
            currency: data.currency,
            order_id: data.id || data.orderId,
            name: 'Fundora Test',
            description: 'Test Payment',
            handler: (response) => {
              setTestResult('✅ Payment successful: ' + response.razorpay_payment_id);
            },
          };
          
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          setTestResult('❌ Razorpay not loaded');
        }
      } else {
        setTestResult('❌ Order creation failed: ' + JSON.stringify(data));
      }
    } catch (error) {
      setTestResult('❌ Error: ' + error.message);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => setRazorpayLoaded(false)}
      />
      
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Razorpay Integration Test</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Razorpay Script Status:</strong>{' '}
            {razorpayLoaded ? '✅ Loaded' : '❌ Not Loaded'}
          </div>
          
          <div>
            <strong>Environment Variables:</strong>
            <ul className="list-disc list-inside ml-4 text-sm">
              <li>NEXT_PUBLIC_RAZORPAY_KEY_ID: {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing'}</li>
              <li>Razorpay Available: {typeof window !== 'undefined' && window.Razorpay ? '✅ Yes' : '❌ No'}</li>
            </ul>
          </div>
          
          <button 
            onClick={testPayment}
            disabled={!razorpayLoaded}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            Test ₹1 Payment
          </button>
          
          {testResult && (
            <div className="p-4 bg-gray-800 rounded">
              <strong>Test Result:</strong><br />
              {testResult}
            </div>
          )}
        </div>
      </div>
    </>
  );
}