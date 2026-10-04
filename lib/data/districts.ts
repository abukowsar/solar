export type District = { bn: string; en: string; division: string };

const raw: [string, string, string][] = [
  ["ঢাকা","Dhaka","Dhaka"],["গাজীপুর","Gazipur","Dhaka"],["নারায়ণগঞ্জ","Narayanganj","Dhaka"],["নরসিংদী","Narsingdi","Dhaka"],["মানিকগঞ্জ","Manikganj","Dhaka"],["মুন্সীগঞ্জ","Munshiganj","Dhaka"],["টাঙ্গাইল","Tangail","Dhaka"],["কিশোরগঞ্জ","Kishoreganj","Dhaka"],["ফরিদপুর","Faridpur","Dhaka"],["গোপালগঞ্জ","Gopalganj","Dhaka"],["মাদারীপুর","Madaripur","Dhaka"],["রাজবাড়ী","Rajbari","Dhaka"],["শরীয়তপুর","Shariatpur","Dhaka"],
  ["চট্টগ্রাম","Chattogram","Chattogram"],["কক্সবাজার","Cox's Bazar","Chattogram"],["কুমিল্লা","Cumilla","Chattogram"],["ফেনী","Feni","Chattogram"],["নোয়াখালী","Noakhali","Chattogram"],["লক্ষ্মীপুর","Lakshmipur","Chattogram"],["চাঁদপুর","Chandpur","Chattogram"],["ব্রাহ্মণবাড়িয়া","Brahmanbaria","Chattogram"],["রাঙ্গামাটি","Rangamati","Chattogram"],["খাগড়াছড়ি","Khagrachhari","Chattogram"],["বান্দরবান","Bandarban","Chattogram"],
  ["রাজশাহী","Rajshahi","Rajshahi"],["বগুড়া","Bogura","Rajshahi"],["পাবনা","Pabna","Rajshahi"],["সিরাজগঞ্জ","Sirajganj","Rajshahi"],["নাটোর","Natore","Rajshahi"],["নওগাঁ","Naogaon","Rajshahi"],["চাঁপাইনবাবগঞ্জ","Chapainawabganj","Rajshahi"],["জয়পুরহাট","Joypurhat","Rajshahi"],
  ["খুলনা","Khulna","Khulna"],["যশোর","Jashore","Khulna"],["সাতক্ষীরা","Satkhira","Khulna"],["বাগেরহাট","Bagerhat","Khulna"],["কুষ্টিয়া","Kushtia","Khulna"],["ঝিনাইদহ","Jhenaidah","Khulna"],["মাগুরা","Magura","Khulna"],["নড়াইল","Narail","Khulna"],["চুয়াডাঙ্গা","Chuadanga","Khulna"],["মেহেরপুর","Meherpur","Khulna"],
  ["বরিশাল","Barishal","Barishal"],["পটুয়াখালী","Patuakhali","Barishal"],["ভোলা","Bhola","Barishal"],["পিরোজপুর","Pirojpur","Barishal"],["ঝালকাঠি","Jhalokati","Barishal"],["বরগুনা","Barguna","Barishal"],
  ["সিলেট","Sylhet","Sylhet"],["মৌলভীবাজার","Moulvibazar","Sylhet"],["হবিগঞ্জ","Habiganj","Sylhet"],["সুনামগঞ্জ","Sunamganj","Sylhet"],
  ["রংপুর","Rangpur","Rangpur"],["দিনাজপুর","Dinajpur","Rangpur"],["কুড়িগ্রাম","Kurigram","Rangpur"],["গাইবান্ধা","Gaibandha","Rangpur"],["লালমনিরহাট","Lalmonirhat","Rangpur"],["নীলফামারী","Nilphamari","Rangpur"],["পঞ্চগড়","Panchagarh","Rangpur"],["ঠাকুরগাঁও","Thakurgaon","Rangpur"],
  ["ময়মনসিংহ","Mymensingh","Mymensingh"],["জামালপুর","Jamalpur","Mymensingh"],["নেত্রকোনা","Netrokona","Mymensingh"],["শেরপুর","Sherpur","Mymensingh"],
];

export const DISTRICTS: District[] = raw.map(([bn, en, division]) => ({ bn, en, division }));
export const DISTRICT_BY_BN: Record<string, District> = Object.fromEntries(DISTRICTS.map((d) => [d.bn, d]));
