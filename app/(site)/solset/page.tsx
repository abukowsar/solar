import SolsetExport from "@/components/SolsetExport";
import { PageHead } from "@/components/ui";

export const metadata = { title: "Solset লিড এক্সপোর্ট · ছাদে সোলার" };

export default function SolsetPage() {
  return (
    <div className="wrap page">
      <PageHead
        crumb="Solset লিড এক্সপোর্ট"
        title="প্রোভাইডারের Solset লিড এক্সপোর্ট"
        desc="Solset সোলার ইনস্টলারদের CRM, Design Studio, কোটেশন ও প্রকল্প ব্যবস্থাপনার প্ল্যাটফর্ম। এর পাবলিক লিড API নেই; লিড নেয় CSV ইমপোর্ট, Zoho, WhatsApp ও বিজ্ঞাপন ফর্ম থেকে। তাই এখানকার অনুরোধ প্রোভাইডারভিত্তিক CSV হিসেবে বের হয়, আর চাইলে Zoho/Zapier ওয়েবহুকে পাঠানো যায়।"
      />
      <div className="split">
        <div>
          <SolsetExport />
        </div>
        <div className="card">
          <h3>কাজের ধারা</h3>
          <ol className="steps-int">
            <li>ছাদ মালিক QR-B স্ক্যান করে সেটআপ অনুরোধ জমা দেন।</li>
            <li>প্রোভাইডার QR-A থেকে নিবন্ধন করে মিলান বোর্ডে নিজের জেলার অনুরোধে আগ্রহ জানান।</li>
            <li>আগ্রহ দেখানো লিড Solset CSV হিসেবে নামিয়ে Solset-এ ইমপোর্ট করুন (অথবা ওয়েবহুকে পাঠান)।</li>
            <li>Solset Design Studio-তে স্যাটেলাইট থেকে ছাদ এঁকে শেড স্টাডি, ডিজাইন ও BOM; BSTI/SREDA মানের যন্ত্রপাতি দিয়ে কোটেশন।</li>
            <li>স্থাপন ও নেট মিটারিং সংযোগ শেষে মিলান বোর্ডে ধাপ হালনাগাদ করুন।</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
