import { supabase } from "../lib/supabaseClient";

export default function FundButton({ projectId, amount }) {
  async function handlePayment() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return alert("Please login first");

    const orderRes = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const order = await orderRes.json();

    if (!order.id && !order.orderId) {
      alert('Order creation failed');
      return;
    }

    const options = {
      key: order.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      order_id: order.orderId || order.id,
      name: "Fundora",
      description: "Project Funding",
      handler: async function (response) {
        await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            projectId,
            amount,
            userId: user.id,
          }),
        });

        alert("Payment successful!");
        window.location.reload();
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <button onClick={handlePayment} className="btn-primary">
      Fund ₹{amount}
    </button>
  );
}
