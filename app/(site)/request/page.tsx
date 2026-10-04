import RequestForm from "@/components/RequestForm";
import { PageHead } from "@/components/ui";

export const metadata = { title: "সেটআপের অনুরোধ · ছাদে সোলার" };

export default function RequestPage() {
  return (
    <div className="wrap page">
      <PageHead
        crumb="ছাদ মালিকের আবেদন"
        title="ছাদে সোলার সেটআপের অনুরোধ"
        desc="৪টি সহজ ধাপে তথ্য দিন — পাশে সঙ্গে সঙ্গে আনুমানিক ক্ষমতা ও আয় দেখবেন। আগ্রহী প্রোভাইডারই শুধু আপনার ফোন নম্বর ও ঠিকানা দেখতে পাবেন।"
      />
      <RequestForm />
    </div>
  );
}
