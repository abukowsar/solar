import DesignStudio from "@/components/DesignStudio";
import { PageHead } from "@/components/ui";

export const metadata = { title: "নিজে ডিজাইন করি · ছাদে সোলার" };

export default function DesignPage() {
  return (
    <div className="wrap page">
      <PageHead
        crumb="নিজে ডিজাইন করি"
        title="নিজে ডিজাইন করি"
        desc="ছাদের মাপ দিন — কতগুলো প্যানেল বসবে, ইনভার্টার ও ব্যাটারি কত লাগবে, খরচ কত আর প্রতি ইউনিট উৎপাদন ব্যয় প্রজ্ঞাপনের ৳৮ সীমার মধ্যে কি না, সঙ্গে সঙ্গে দেখুন। ডিজাইনটি সংরক্ষণ করে Solset-এ পাঠানো যায় এবং সরাসরি সেটআপ অনুরোধে যুক্ত করা যায়।"
      />
      <DesignStudio />
    </div>
  );
}
