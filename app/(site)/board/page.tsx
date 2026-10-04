import Board from "@/components/Board";
import { PageHead } from "@/components/ui";

export const metadata = { title: "মিলান বোর্ড · ছাদে সোলার" };

export default function BoardPage() {
  return (
    <div className="wrap page">
      <PageHead
        crumb="মিলান বোর্ড"
        title="মিলান বোর্ড"
        desc="প্রতিটি অনুরোধের পাশে সেই জেলায় কাজ করা প্রোভাইডাররা অগ্রাধিকার ক্রমে দেখানো হয় (✓ = জেলায় তালিকাভুক্ত)। আগ্রহ জানালে গ্রাহকের যোগাযোগের তথ্য দেখবেন এবং ধাপ হালনাগাদ করতে পারবেন।"
      />
      <Board />
    </div>
  );
}
