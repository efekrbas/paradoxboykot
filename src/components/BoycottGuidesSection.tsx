"use client";

import { useState } from "react";
import {
  FileText,
  RotateCcw,
  ShieldAlert,
  Download,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { playStampSound } from "@/lib/audio";

const STEAM_REFUND_TEMPLATE = `Paradox Interactive firmasının resmi topluluk kanalında Türkiye Cumhuriyeti kurucu lideri Gazi Mustafa Kemal Atatürk'e yönelik açıkça nefret söylemi ve asılsız soykırım iftirası atılmış; buna itiraz eden yüzlerce Türk oyuncuyla birlikte hesabım haksızca sansürlenmiştir. Şirket yönetimi bu nefret söylemine karşı resmi bir özür dilememiş ve etik kuralları ihlal etmiştir. Tüketici olarak bu kabul edilemez tutum nedeniyle satın aldığım içeriğin iadesini talep ediyorum.`;

const DISCORD_REPORT_TEMPLATE = `The official Hearts of Iron IV Discord server (run by Paradox Interactive) is actively violating Discord Community Guidelines regarding Hate Speech and Harassment. On this server, community moderator 'chakerathe' slandered the national founding father of Turkey, Mustafa Kemal Atatürk, falsely accusing him of genocide, and initiated mass bans against Turkish users who respectfully corrected the misinformation. The server leadership condones historical hate speech while permitting avatars of Stalin and Churchill. I request an official investigation of this partnered/verified community.`;

export function BoycottGuidesSection() {
  const [activeTab, setActiveTab] = useState<"refund" | "discord" | "kit">("refund");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = async (type: string, text: string) => {
    playStampSound();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      toast.success("Şablon metni panoya kopyalandı!", {
        description: "İlgili destek formuna doğrudan yapıştırabilirsiniz.",
      });
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      toast.error("Metin kopyalanamadı.");
    }
  };

  return (
    <section id="eylem-rehberleri" className="mx-auto max-w-[1240px] px-5 pt-6 sm:pt-7 pb-12 scroll-mt-16 sm:scroll-mt-20">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-seal">
            <ShieldAlert className="size-3.5" />
            Hukuki & Tüketici Hakları Eylemleri
          </div>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl tracking-tight uppercase">
            Eylem Rehberleri: İade, Şikayet & Sosyal Kit
          </h2>
        </div>
        <p className="max-w-[48ch] text-xs text-mute sm:text-sm">
          Sadece mağazada 1 yıldız vermekle kalmayın; şirket yönetimini doğrudan finansal ve kurumsal platformlarda da sıkıştırın.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-ink/15 pb-3">
        <button
          type="button"
          onClick={() => {
            playStampSound();
            setActiveTab("refund");
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors border ${
            activeTab === "refund"
              ? "border-ink bg-ink text-paper font-bold"
              : "border-ink/20 bg-paper text-ink hover:border-ink"
          }`}
        >
          <RotateCcw className="size-3.5 text-seal" />
          <span>Steam İade (Refund) Rehberi</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playStampSound();
            setActiveTab("discord");
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors border ${
            activeTab === "discord"
              ? "border-ink bg-ink text-paper font-bold"
              : "border-ink/20 bg-paper text-ink hover:border-ink"
          }`}
        >
          <ShieldAlert className="size-3.5 text-seal" />
          <span>Discord Trust & Safety Şikayeti</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playStampSound();
            setActiveTab("kit");
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors border ${
            activeTab === "kit"
              ? "border-ink bg-ink text-paper font-bold"
              : "border-ink/20 bg-paper text-ink hover:border-ink"
          }`}
        >
          <Download className="size-3.5 text-seal" />
          <span>Boykot Profil & Avatar Kiti</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* TAB 1: STEAM REFUND */}
        {activeTab === "refund" && (
          <div className="grid gap-6 lg:grid-cols-12 border-2 border-ink bg-paper p-6 sm:p-8">
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-seal">
                  Adım Adım Steam Para İadesi
                </span>
                <h3 className="mt-2 font-display text-2xl uppercase tracking-tight">
                  DLC veya Oyununuzu İade Edin
                </h3>
                <p className="mt-3 text-sm text-mute leading-relaxed">
                  Steam politikalarına göre 14 gün / 2 saat kuralı esastır; ancak yayıncının açıkça nefret söylemi
                  ve topluluk ayrımcılığı yaptığı durumlarda Steam Destek ekibi istisnai iade taleplerini
                  manuel olarak incelemektedir.
                </p>

                <ol className="mt-4 space-y-2 font-mono text-xs text-ink/80 list-decimal list-inside">
                  <li>
                    <a
                      href="https://help.steampowered.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-seal underline font-bold"
                    >
                      help.steampowered.com
                    </a>{" "}
                    adresine gidin.
                  </li>
                  <li>Satın Alma İşlemleri sekmesinden Paradox oyununu veya DLC'sini seçin.</li>
                  <li>"Beklediğim gibi değil" veya "Bir sorunum var" seçeneğini işaretleyin.</li>
                  <li>Açıklama alanına yandaki hazır iade metnini yapıştırıp gönderin.</li>
                </ol>
              </div>

              <div className="mt-6 pt-4 border-t border-ink/15">
                <a
                  href="https://help.steampowered.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2.5 font-mono text-xs uppercase tracking-wider hover:bg-seal transition-colors"
                >
                  <span>Steam Destek'i Aç</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 border border-ink/20 bg-ink/5 p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-mute pb-2 border-b border-ink/15">
                  <span className="font-bold text-ink">Hazır Steam İade Açıklaması</span>
                  <span className="text-seal font-semibold">Türkçe</span>
                </div>
                <p className="mt-3 font-mono text-xs leading-relaxed text-ink/90 whitespace-pre-line bg-paper p-3 border border-ink/10">
                  {STEAM_REFUND_TEMPLATE}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleCopy("steam", STEAM_REFUND_TEMPLATE)}
                  className="inline-flex items-center gap-2 bg-seal text-paper px-4 py-2 font-mono text-xs uppercase tracking-wider hover:brightness-110 transition-all"
                >
                  {copiedType === "steam" ? (
                    <>
                      <Check className="size-3.5 text-emerald-300" />
                      <span>Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>İade Metnini Kopyala</span>
                    </>
                  )}
                </button>
                <span className="font-mono text-[11px] text-mute">Steam Destek metin kutusuna yapıştırın</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DISCORD REPORT */}
        {activeTab === "discord" && (
          <div className="grid gap-6 lg:grid-cols-12 border-2 border-ink bg-paper p-6 sm:p-8">
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-seal">
                  Resmi Topluluk İhlali Raporu
                </span>
                <h3 className="mt-2 font-display text-2xl uppercase tracking-tight">
                  Discord Genel Merkezi'ne Şikayet
                </h3>
                <p className="mt-3 text-sm text-mute leading-relaxed">
                  Discord Topluluk Kuralları (Community Guidelines) gereğince hiçbir resmi veya doğrulanmış
                  (partnered) sunucuda nefret söylemi ve ayrımcılık tolere edilemez. Toplu şikayetler sunucu
                  rozetinin kaldırılmasına veya incelemeye alınmasına yol açar.
                </p>

                <ol className="mt-4 space-y-2 font-mono text-xs text-ink/80 list-decimal list-inside">
                  <li>
                    <a
                      href="https://dis.gd/request"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-seal underline font-bold"
                    >
                      dis.gd/request
                    </a>{" "}
                    (Discord Güvenlik Merkezi) formunu açın.
                  </li>
                  <li>Konu olarak "Hate Speech / Harassment" (Nefret Söylemi) kategorisini seçin.</li>
                  <li>Sunucu olarak Hearts of Iron IV resmi Discord sunucu davet linkini belirtin.</li>
                  <li>Açıklama alanına yandaki İngilizce resmi bildirim metnini ekleyin.</li>
                </ol>
              </div>

              <div className="mt-6 pt-4 border-t border-ink/15">
                <a
                  href="https://dis.gd/request"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2.5 font-mono text-xs uppercase tracking-wider hover:bg-seal transition-colors"
                >
                  <span>Discord Talep Formunu Aç</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 border border-ink/20 bg-ink/5 p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-mute pb-2 border-b border-ink/15">
                  <span className="font-bold text-ink">Official Discord Report Template</span>
                  <span className="text-seal font-semibold">English (Global)</span>
                </div>
                <p className="mt-3 font-mono text-xs leading-relaxed text-ink/90 whitespace-pre-line bg-paper p-3 border border-ink/10">
                  {DISCORD_REPORT_TEMPLATE}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleCopy("discord", DISCORD_REPORT_TEMPLATE)}
                  className="inline-flex items-center gap-2 bg-seal text-paper px-4 py-2 font-mono text-xs uppercase tracking-wider hover:brightness-110 transition-all"
                >
                  {copiedType === "discord" ? (
                    <>
                      <Check className="size-3.5 text-emerald-300" />
                      <span>Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Rapor Metnini Kopyala</span>
                    </>
                  )}
                </button>
                <span className="font-mono text-[11px] text-mute">dis.gd/request formuna yapıştırın</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AVATAR & PROTEST KIT */}
        {activeTab === "kit" && (
          <div className="border-2 border-ink bg-paper p-6 sm:p-8">
            <div className="max-w-2xl">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-seal">
                Sosyal Medya & Profil Eylemi
              </span>
              <h3 className="mt-2 font-display text-2xl uppercase tracking-tight">
                Steam, Discord ve X İçin Boykot Avatarları
              </h3>
              <p className="mt-3 text-sm text-mute leading-relaxed">
                Steam, Discord ve Twitter profil fotoğraflarınızı Atatürk portresi veya kırmızı mühürlü boykot
                rozetimizle güncelleyerek görünürlüğü katlayın. Birlik olduğumuzu her platformda gösterelim.
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Asset 1: Red Stamp Badge */}
              <div className="border border-ink/20 p-5 bg-ink/5 flex flex-col items-center text-center">
                <div className="size-24 rounded-full border-2 border-ink/20 overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src="/boykot-logo.png"
                    alt="Paradox Boykot Logosu"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 font-display text-lg uppercase tracking-tight">
                  Boykot Profil Fotoğrafı
                </div>
                <div className="font-mono text-[11px] text-mute mt-1">
                  Steam & Discord İçin (Kare)
                </div>
                <a
                  href="/boykot-logo.png"
                  download="Boykot-Paradox-Logo.png"
                  className="mt-4 inline-flex items-center gap-1.5 bg-seal text-paper px-4 py-2 font-mono text-xs uppercase tracking-wider hover:brightness-110 transition-colors w-full justify-center"
                >
                  <Download className="size-3.5" />
                  <span>Logoyu İndir</span>
                </a>
              </div>

              {/* Asset 2: Official Transparent Bust */}
              <div className="border border-ink/20 p-5 bg-ink/5 flex flex-col items-center text-center">
                <div className="size-24 rounded-full border-2 border-ink/20 overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src="/ataturk-portrait.png"
                    alt="Atatürk Portresi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 font-display text-lg uppercase tracking-tight">
                  Gazi Atatürk Portresi
                </div>
                <div className="font-mono text-[11px] text-mute mt-1">
                  Banlanan Türk Oyuncunun Avatarı
                </div>
                <a
                  href="/ataturk-portrait.png"
                  download="Gazi-Mustafa-Kemal-Ataturk.png"
                  className="mt-4 inline-flex items-center gap-1.5 bg-ink text-paper px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-seal transition-colors w-full justify-center"
                >
                  <Download className="size-3.5" />
                  <span>Portreyi İndir</span>
                </a>
              </div>

              {/* Asset 3: Petition & Dossier Link */}
              <div className="border border-ink/20 p-5 bg-ink/5 flex flex-col justify-between text-left">
                <div>
                  <span className="font-mono text-xs font-bold uppercase text-seal">Resmi Dokümantasyon</span>
                  <div className="mt-2 font-display text-lg uppercase tracking-tight">
                    Boykot Basın Dosyası (llms.txt)
                  </div>
                  <p className="mt-2 text-xs text-mute leading-relaxed">
                    Yapay zeka motorları, bağımsız araştırmacılar ve gazeteciler için hazırlanmış tarafsız İngilizce
                    ve Türkçe kronolojik skandal dosyası.
                  </p>
                </div>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 border border-ink/30 bg-paper px-4 py-2 font-mono text-xs uppercase tracking-wider text-ink hover:border-ink hover:text-seal transition-colors justify-center"
                >
                  <span>Dosyayı Görüntüle</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
