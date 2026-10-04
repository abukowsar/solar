import ProviderForm from "@/components/ProviderForm";
import { PageHead } from "@/components/ui";

export const metadata = { title: "প্রোভাইডার নিবন্ধন · ছাদে সোলার" };

export default function ProviderPage() {
  return (
    <div className="wrap page">
      <PageHead
        crumb="প্রোভাইডার নিবন্ধন"
        title="রুফটপ সোলার সার্ভিস প্রোভাইডার নিবন্ধন"
        desc="৩ ধাপে নিবন্ধন করে মিলান বোর্ডে নিজের জেলার সেটআপ অনুরোধ দেখুন এবং আগ্রহ দেখানো লিড Solset-এ নিন। সরকারি তালিকাভুক্তির আবেদন আলাদাভাবে জেলার বিদ্যুৎ বিতরণ অফিসে জমা দিতে হবে।"
      />
      <ProviderForm />
    </div>
  );
}
