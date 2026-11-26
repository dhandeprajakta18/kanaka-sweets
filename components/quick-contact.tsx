import { MessageCircle, Phone } from "lucide-react";

const phone = "+919493086948";

export default function QuickContact() {
  return (
    <aside aria-label="Quick contact" className="fixed bottom-4 right-4 z-50 flex gap-3 sm:bottom-6 sm:right-6">
      <a href={`tel:${phone}`} aria-label="Call Kanaka Sweets" className="flex size-12 items-center justify-center rounded-full bg-[#641C2B] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4B1420]">
        <Phone size={20} aria-hidden="true" />
      </a>
      <a href="https://wa.me/919493086948?text=Hello%20Kanaka%20Sweets%2C%20I%20would%20like%20to%20place%20an%20order." target="_blank" rel="noopener noreferrer" aria-label="Chat with Kanaka Sweets on WhatsApp" className="flex size-12 items-center justify-center rounded-full bg-[#247A45] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#1B6136]">
        <MessageCircle size={21} aria-hidden="true" />
      </a>
    </aside>
  );
}
