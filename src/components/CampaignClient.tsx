"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Flame,
  Star,
  ExternalLink,
  ShieldAlert,
  Search,
  Building2,
  FileText,
  Award,
  Layers,
  Sparkles,
  PenLine,
  Newspaper,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

import { XIcon } from "@/components/icons/XIcon";
import { GAMES, CORPORATE_TARGETS, PHYSICAL_STUDIOS, DEMANDS, type Game } from "@/data/boycottData";
import { SteamRatingDisplay } from "@/components/SteamRatingDisplay";
import {
  DEFAULT_STEAM_REVIEWS,
  type SteamReviewSummary,
} from "@/lib/steam";
import { playStampSound } from "@/lib/audio";
import { AudioStampToggle } from "@/components/AudioStampToggle";
import { ReviewTemplatesSection } from "@/components/ReviewTemplatesSection";
import { CorporateTargetsSection } from "@/components/CorporateTargetsSection";
import { PetitionSection, PETITION_URL } from "@/components/PetitionSection";
import { AntiSpamGuideSection } from "@/components/AntiSpamGuideSection";
import { CeoRaidSection } from "@/components/CeoRaidSection";
import { ShareholderMailSection } from "@/components/ShareholderMailSection";
import { DirectMailSection } from "@/components/DirectMailSection";
import { BoycottGuidesSection } from "@/components/BoycottGuidesSection";
import { BulkLauncherModal } from "@/components/BulkLauncherModal";
import { ShareBar } from "@/components/ShareBar";
import { Ataturk3DScene } from "@/components/Ataturk3DScene";
import { NewsSourcesSection } from "@/components/NewsSourcesSection";
import { FaqSection } from "@/components/FaqSection";

const SOURCE_URL =
  "https://www.odatv.com/guncel/paradoxtan-ataturk-skandali-hearts-of-ironin-discord-sunucusunda-boykot-120163837";

const STORAGE_VOTES_KEY = "boykot-paradox-oylar";
const STORAGE_STAMPS_KEY = "boykot-paradox-stamps";

// Campaign reference start: 22 September 2026 12:00:00
export const CAMPAIGN_REF_MS = new Date("2026-09-22T12:00:00+03:00").getTime();
export const BASE_TOTAL_VOTES = 6934;

const tr = (n: number) => n.toLocaleString("tr-TR");

interface CampaignClientProps {
  initialSteamReviews?: Record<number, SteamReviewSummary>;
}

export function CampaignClient({
  initialSteamReviews,
}: CampaignClientProps = {}) {
  const [steamReviews, setSteamReviews] = useState<Record<number, SteamReviewSummary>>(
    initialSteamReviews || DEFAULT_STEAM_REVIEWS
  );
  const [isRefreshingSteam, setIsRefreshingSteam] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "negative" | "rating">("default");
  const [votedGames, setVotedGames] = useState<string[]>([]);
  const [stampedPlatforms, setStampedPlatforms] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const gamesSliderRef = useRef<HTMLDivElement>(null);

  const scrollGamesSlider = (direction: "left" | "right") => {
    if (gamesSliderRef.current) {
      const scrollAmount = Math.max(340, gamesSliderRef.current.clientWidth * 0.75);
      gamesSliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Reset scroll position when filters/sort change
  useEffect(() => {
    if (gamesSliderRef.current) {
      gamesSliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [sortBy, selectedCategory, searchTerm]);

  // Horizontal mouse wheel scrolling
  useEffect(() => {
    const slider = gamesSliderRef.current;
    if (!slider) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        const isScrollingUp = e.deltaY < 0;
        const isScrollingDown = e.deltaY > 0;
        const atFarLeft = slider.scrollLeft <= 5;
        const atFarRight = slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 5;

        // En sola gelindiğinde yukarı kaydırmaya devam edilirse sayfayı yukarı kaydır
        if (isScrollingUp && atFarLeft) {
          e.preventDefault();
          window.scrollBy({
            top: e.deltaY,
            behavior: "auto",
          });
          return;
        }

        // En sağa gelindiğinde aşağı kaydırmaya devam edilirse sayfayı aşağı kaydır
        if (isScrollingDown && atFarRight) {
          e.preventDefault();
          window.scrollBy({
            top: e.deltaY,
            behavior: "auto",
          });
          return;
        }

        e.preventDefault();
        slider.scrollBy({
          left: e.deltaY * 1.5,
          behavior: "auto",
        });
      }
    };

    slider.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      slider.removeEventListener("wheel", handleWheel);
    };
  }, []);


  useEffect(() => {
    try {
      const rawVotes = localStorage.getItem(STORAGE_VOTES_KEY);
      if (rawVotes) setVotedGames(JSON.parse(rawVotes) as string[]);
      const rawStamps = localStorage.getItem(STORAGE_STAMPS_KEY);
      if (rawStamps) setStampedPlatforms(JSON.parse(rawStamps) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const refreshSteamReviews = async (showToast = true) => {
    setIsRefreshingSteam(true);
    try {
      const res = await fetch("/api/steam-reviews");
      if (res.ok) {
        const data = await res.json();
        if (data.reviews) {
          setSteamReviews(data.reviews);
          if (showToast) {
            toast.success("Steam verileri canlı olarak güncellendi!");
          }
        }
      }
    } catch (e) {
      if (showToast) {
        toast.error("Steam verileri yenilenirken bağlantı hatası oluştu.");
      }
    } finally {
      setIsRefreshingSteam(false);
    }
  };

  useEffect(() => {
    // Poll Steam API every 3 minutes for live stats
    const interval = setInterval(() => {
      refreshSteamReviews(false);
    }, 180000);
    return () => clearInterval(interval);
  }, []);

  const totalSteamNegatives = useMemo(() => {
    return Object.values(steamReviews).reduce((sum, item) => sum + (item?.total_negative || 0), 0);
  }, [steamReviews]);

  const toggleVoteGame = (id: string) => {
    playStampSound();
    setVotedGames((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_VOTES_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      if (!exists) {
        toast.success("1 Yıldız Verildi!", {
          description: "Aşağıdaki platform linklerine tıklayarak incelemenizi yayınlayın.",
        });
      }
      return next;
    });
  };

  const toggleStampPlatform = (targetId: string) => {
    setStampedPlatforms((prev) => {
      const exists = prev.includes(targetId);
      const next = exists ? prev.filter((item) => item !== targetId) : [...prev, targetId];
      try {
        localStorage.setItem(STORAGE_STAMPS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const markPlatformAsStamped = (targetId: string) => {
    setStampedPlatforms((prev) => {
      if (prev.includes(targetId)) return prev;
      const next = [...prev, targetId];
      try {
        localStorage.setItem(STORAGE_STAMPS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const handleOpenGamePlatforms = (game: Game) => {
    playStampSound();
    toast.info(`${game.title} için tüm platform sayfaları açılıyor...`, {
      description: "Açılır pencerelere izin verin veya sırayla tıklayın.",
    });

    if (!votedGames.includes(game.id)) {
      toggleVoteGame(game.id);
    }

    game.platforms.forEach((p, idx) => {
      setTimeout(() => {
        window.open(p.url, "_blank", "noopener,noreferrer");
        markPlatformAsStamped(`${game.id}-${p.id}`);
      }, idx * 250);
    });
  };

  // Calculate total votes (Base + Real Steam API Negatives + User's local votes)
  const totalVotes = BASE_TOTAL_VOTES + totalSteamNegatives + votedGames.length;

  // Total possible stamp count (games platforms + corporate targets + physical studios)
  const totalTargetsCount =
    CORPORATE_TARGETS.length +
    PHYSICAL_STUDIOS.length +
    GAMES.reduce((acc, g) => acc + g.platforms.length, 0);

  // Filter & sort games
  const filteredGames = useMemo(() => {
    const list = GAMES.filter((game) => {
      const matchesSearch =
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.genre.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategory === "epic") {
        return game.platforms.some((p) => p.type === "epic");
      }
      if (selectedCategory === "gog") {
        return game.platforms.some((p) => p.type === "gog");
      }
      if (selectedCategory === "strategy") {
        return game.genre.includes("Strateji");
      }
      return true;
    });

    if (sortBy === "negative") {
      return [...list].sort((a, b) => {
        const negA = steamReviews[a.appId]?.total_negative ?? 0;
        const negB = steamReviews[b.appId]?.total_negative ?? 0;
        return negB - negA;
      });
    }

    if (sortBy === "rating") {
      return [...list].sort((a, b) => {
        const rateA = steamReviews[a.appId]?.star_rating ?? 5;
        const rateB = steamReviews[b.appId]?.star_rating ?? 5;
        return rateA - rateB;
      });
    }

    return list;
  }, [searchTerm, selectedCategory, sortBy, steamReviews]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const header = document.querySelector("header");
    const headerHeight = header ? header.getBoundingClientRect().height : 60;
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
    const targetY = elementPosition - headerHeight;
    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: "smooth",
    });
  };

  const [isDarkHeader, setIsDarkHeader] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const anitEl = document.getElementById("anit");
      if (!anitEl) {
        const heroEl = document.getElementById("hero");
        if (heroEl) {
          setIsDarkHeader(heroEl.getBoundingClientRect().bottom > 55);
        }
        return;
      }
      const rect = anitEl.getBoundingClientRect();
      // Stay dark while within hero or Ataturk monument. Switch to paper theme once scrolled into games.
      setIsDarkHeader(rect.bottom > 55);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-paper font-body text-ink antialiased selection:bg-seal selection:text-paper">
      {/* Sticky Main Header - Adaptive Navbar (Dark in Hero/Monument, Paper in Catalog/Sections) */}
      <header
        className={`sticky -top-px z-40 border-b-2 backdrop-blur-md transition-all duration-300 ${
          isDarkHeader
            ? "border-seal/40 bg-ink/95 text-paper shadow-xl shadow-black/50"
            : "border-ink bg-paper/90 text-ink shadow-md shadow-ink/5"
        }`}
      >
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-3.5">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 sm:gap-3 text-left focus:outline-none group cursor-pointer"
            title="En Üste Git"
          >
            <img
              src="/favicon.png"
              alt="Atatürk Rozet Logo"
              className="size-8 sm:size-9 object-contain drop-shadow-sm rounded-full transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2.5">
              <span
                className={`font-display text-xl sm:text-2xl leading-none tracking-tight transition-colors group-hover:text-seal ${
                  isDarkHeader ? "text-paper" : "text-ink"
                }`}
              >
                BOYKOT PARADOX
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5">
            {/* User progress counter */}
            <div className="hidden text-right leading-none md:block">
              <div
                className={`font-mono text-[9px] uppercase tracking-[0.16em] transition-colors ${
                  isDarkHeader ? "text-paper/50" : "text-mute"
                }`}
              >
                Senin Katkın
              </div>
              <div
                className={`font-mono text-sm font-bold transition-colors ${
                  isDarkHeader ? "text-paper" : "text-ink"
                }`}
              >
                <span className="text-seal">{stampedPlatforms.length}</span> / {totalTargetsCount} Platform
              </div>
            </div>

            {/* Total 1 star counter */}
            <div className="text-right leading-none">
              <div
                className={`flex items-center justify-end gap-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  isDarkHeader ? "text-paper/50" : "text-mute"
                }`}
              >
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
                </span>
                <span
                  className={`font-bold transition-colors ${
                    isDarkHeader ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  Canlı
                </span>
                <span className="hidden xs:inline">Toplam 1★</span>
              </div>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <div
                  suppressHydrationWarning
                  className="font-mono text-lg sm:text-2xl font-bold tabular-nums transition-colors duration-300 text-seal"
                >
                  {tr(totalVotes)}
                </div>
              </div>
            </div>

            <AudioStampToggle dark={isDarkHeader} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-ink text-paper">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(110% 70% at 50% 30%, oklch(0.556 0.216 27.5) 0%, transparent 75%)",
          }}
        />

        <div className="relative mx-auto max-w-[1240px] px-5 pt-4 pb-3 sm:pt-8 sm:pb-4">
          <div className="rise flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-seal">
            <span className="size-2 animate-pulse rounded-full bg-seal" />
            Steam · Metacritic · Trustpilot · Google · Epic · GOG · Xbox
          </div>

          {/* Hero Desktop Right: Steam Parody 1★ Rating Card & Stamp */}
          <div className="hidden lg:flex absolute right-5 top-[116px] xl:top-[124px] flex-col items-end pointer-events-auto z-10">
            <div
              onClick={() => {
                playStampSound();
                toast.success("1★ Boykot Damgası Vuruldu! Platformları açıp oylamayı unutmayın.", {
                  icon: "★",
                });
              }}
              title="Tıkla ve 1★ damgasını vur!"
              className="group cursor-pointer select-none transition-transform active:scale-95"
            >
              {/* Stamp Card */}
              <div className="relative border-2 border-dashed border-seal bg-paper/5 backdrop-blur-md p-5 shadow-2xl shadow-seal/20 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-seal/35 group-hover:bg-paper/10 w-[270px]">
                {/* Header Tag */}
                <div className="absolute -top-3 left-4 bg-seal px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-paper shadow-sm">
                  BOYKOT HEDEFİ
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-baseline gap-1.5 text-seal">
                    <Star className="size-8 fill-seal text-seal animate-pulse" />
                    <span className="font-display text-5xl leading-none font-bold text-paper">
                      1.0
                    </span>
                    <span className="font-mono text-xs text-paper/50">/ 5.0</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block border border-seal/40 bg-seal/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-seal">
                      BOYKOT
                    </span>
                  </div>
                </div>

                {/* Steam Overwhelmingly Negative parody banner */}
                <div className="mt-3 border-t border-b border-seal/30 py-2">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-black uppercase tracking-wider text-seal">
                    <span className="size-2 rounded-full bg-seal animate-ping" />
                    <span>HEDEF: SON DERECE OLUMSUZ</span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-paper/70 leading-relaxed">
                    Steam, Metacritic, Google & Trustpilot üzerinde binlerce oyuncunun ortak hedefi.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-paper/40 uppercase">Gerekçe:</span>
                  <span className="font-bold text-seal">Atatürk'e Saygısızlık</span>
                </div>

                <div className="mt-3 rounded border border-seal/30 bg-seal/10 py-1.5 text-center font-mono text-[10px] text-seal font-bold group-hover:bg-seal group-hover:text-paper transition-colors">
                  👉 Tıkla ve Damgayı Vur!
                </div>
              </div>
            </div>
          </div>

          <h1
            className="rise mt-5 font-display text-[clamp(2.3rem,10vw,9.5rem)] leading-[0.98] tracking-tight uppercase"
            style={{ animationDelay: "80ms" }}
          >
            PARADOX
            <br />
            HESAP VERECEK
          </h1>

          <p
            className="rise mt-4 max-w-[62ch] text-sm sm:text-base text-pretty text-paper/85 leading-relaxed"
            style={{ animationDelay: "160ms" }}
          >
            Paradox'un resmi Discord'unda bir Türk oyuncunun <strong>Atatürk profil fotoğrafı</strong> sebebiyle banlanmasına ve itiraz eden yüzlerce oyuncunun <strong>topluca susturulmasına</strong> sessiz kalmıyoruz: <strong>Tüm oyunlara, mağazalara ve Google'a tek tıkla 1 yıldız veriyoruz!</strong>
          </p>

          {/* Primary Action Buttons */}
          <div
            className="rise mt-5 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full"
            style={{ animationDelay: "240ms" }}
          >
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="grow group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 bg-seal px-4 py-3 font-mono text-xs sm:text-xs font-bold uppercase tracking-[0.12em] text-paper transition-all hover:brightness-110 shadow-lg shadow-seal/25 active:translate-y-px"
            >
              <Flame className="size-4 animate-bounce" />
              <span>Tek Tıkla 1★ Baskını Başlat</span>
            </button>

            <a
              href={PETITION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="grow group inline-flex w-full sm:w-auto items-center justify-center gap-2 border-2 border-seal bg-seal/20 px-4 py-3 font-mono text-xs sm:text-xs font-bold uppercase tracking-[0.12em] text-paper transition-all hover:bg-seal hover:text-paper shadow-md shadow-seal/10"
            >
              <PenLine className="size-4 text-seal group-hover:text-paper transition-colors" />
              <span>İmza Kampanyasına Katıl</span>
              <ExternalLink className="size-3.5 opacity-80" />
            </a>

            <button
              type="button"
              onClick={() => scrollTo("sablonlar")}
              className="grow inline-flex w-full sm:w-auto items-center justify-center gap-2 border-2 border-paper/40 bg-paper/10 px-4 py-3 font-mono text-xs sm:text-xs font-bold uppercase tracking-[0.12em] text-paper transition-all hover:border-paper hover:bg-paper/20"
            >
              <FileText className="size-4" />
              <span>Hazır 1★ Metinleri</span>
            </button>

            <button
              type="button"
              onClick={() => scrollTo("tweet-baskini")}
              className="grow inline-flex w-full sm:w-auto items-center justify-center gap-2.5 border-2 border-paper/40 bg-black px-4 py-3 font-mono text-xs sm:text-xs font-bold uppercase tracking-[0.12em] text-paper transition-all hover:border-paper hover:bg-neutral-900 shadow-lg shadow-black/50 active:translate-y-px"
            >
              <XIcon className="size-4 text-paper" />
              <span>X / CEO Baskını</span>
            </button>

            <button
              type="button"
              onClick={() => scrollTo("hissedar-baskisi")}
              className="grow inline-flex w-full sm:w-auto items-center justify-center gap-2 border-2 border-seal/50 bg-paper/5 px-4 py-3 font-mono text-xs sm:text-xs font-bold uppercase tracking-[0.12em] text-seal transition-all hover:border-seal hover:bg-seal/10 active:translate-y-px"
            >
              <TrendingDown className="size-4" />
              <span>Hissedar Maili</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3D Atatürk Monument Scene - Proudly & Seamlessly Placed Right Below Hero */}
      <Ataturk3DScene />

      {/* Games Catalog Section */}
      <section id="oyunlar" className="mx-auto max-w-[1240px] px-5 pt-8 sm:pt-10 pb-12 scroll-mt-16 sm:scroll-mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-3">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-seal">
              <Layers className="size-3.5" />
              Tüm Platformlarda Puanlama
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl lg:text-4xl tracking-tight uppercase">
              Tüm Oyunlara 1 Yıldız Ver
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => refreshSteamReviews(true)}
              disabled={isRefreshingSteam}
              title="Steam API canlı verilerini hemen güncelle"
              className="inline-flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs uppercase text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <RefreshCw className={`size-3.5 ${isRefreshingSteam ? "animate-spin" : ""}`} />
              <span>Steam Canlı ({Object.keys(steamReviews).length} Oyun)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="inline-flex items-center gap-2 bg-ink px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-paper hover:bg-seal transition-colors"
            >
              <Flame className="size-3.5 text-seal" />
              <span>Hepsini Birden Aç (Baskın Modu)</span>
            </button>
          </div>
        </div>

        {/* Dedicated Filtering & Sorting Controls Bar */}
        <div className="mt-4 flex flex-col gap-2.5 bg-paper/60 p-3 sm:p-3.5 border border-ink/15 shadow-sm">
          {/* Top row: Category Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-mute font-bold mr-1">
                <Filter className="size-3.5 text-seal" />
                Filtrele:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition-all ${selectedCategory === "all"
                    ? "bg-ink text-paper font-bold shadow-sm"
                    : "border border-ink/20 bg-paper text-ink hover:border-ink"
                  }`}
              >
                Tüm Oyunlar ({GAMES.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("strategy")}
                className={`px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition-all ${selectedCategory === "strategy"
                    ? "bg-ink text-paper font-bold shadow-sm"
                    : "border border-ink/20 bg-paper text-ink hover:border-ink"
                  }`}
              >
                Strateji ({GAMES.filter((g) => g.genre.includes("Strateji")).length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("epic")}
                className={`px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition-all ${selectedCategory === "epic"
                    ? "bg-ink text-paper font-bold shadow-sm"
                    : "border border-ink/20 bg-paper text-ink hover:border-ink"
                  }`}
              >
                Epic Games
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("gog")}
                className={`px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition-all ${selectedCategory === "gog"
                    ? "bg-ink text-paper font-bold shadow-sm"
                    : "border border-ink/20 bg-paper text-ink hover:border-ink"
                  }`}
              >
                GOG
              </button>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-mute" />
              <input
                type="text"
                placeholder="Oyun ara (HOI4, EU4...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-ink/25 bg-paper py-1 pl-9 pr-3 font-mono text-xs text-ink outline-none focus:border-ink"
              />
            </div>
          </div>

          {/* Bottom row: Sort Options & Slide indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-ink/10 pt-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-mute font-bold mr-1">
                <ArrowUpDown className="size-3.5 text-seal" />
                Sırala:
              </span>
              <button
                type="button"
                onClick={() => setSortBy("default")}
                className={`px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider transition-all ${sortBy === "default"
                    ? "bg-ink text-paper font-bold shadow-sm"
                    : "border border-ink/20 bg-paper text-ink hover:border-ink"
                  }`}
              >
                Varsayılan
              </button>
              <button
                type="button"
                onClick={() => setSortBy("negative")}
                className={`px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider transition-all ${sortBy === "negative"
                    ? "bg-seal text-paper font-bold shadow-sm shadow-seal/20"
                    : "border border-ink/20 bg-paper text-ink hover:border-seal hover:text-seal"
                  }`}
              >
                En Çok Olumsuz (Steam API)
              </button>
              <button
                type="button"
                onClick={() => setSortBy("rating")}
                className={`px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider transition-all ${sortBy === "rating"
                    ? "bg-amber-600 text-paper font-bold shadow-sm shadow-amber-600/20"
                    : "border border-ink/20 bg-paper text-ink hover:border-amber-600 hover:text-amber-600"
                  }`}
              >
                En Düşük Puan
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-mute hidden sm:inline" title="Farenin kaydırma tekerleği veya düğmelerle yana kaydırabilirsiniz">
                Yana Kaydır ({filteredGames.length} Oyun) →
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollGamesSlider("left")}
                  className="flex size-7 items-center justify-center border-2 border-ink/20 bg-paper text-ink hover:border-ink hover:bg-ink hover:text-paper transition-colors shadow-sm"
                  title="Sola Kaydır"
                  aria-label="Sola Kaydır"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollGamesSlider("right")}
                  className="flex size-7 items-center justify-center border-2 border-ink/20 bg-paper text-ink hover:border-ink hover:bg-ink hover:text-paper transition-colors shadow-sm"
                  title="Sağa Kaydır"
                  aria-label="Sağa Kaydır"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontally Scrolling Game Cards Container */}
        <div
          ref={gamesSliderRef}
          tabIndex={0}
          className="mt-4 flex gap-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory focus:outline-none [scrollbar-width:thin] [scrollbar-color:oklch(0.556_0.216_27.5)_transparent]"
        >
          {filteredGames.map((game) => {
            const isVoted = votedGames.includes(game.id);
            const imageSrc = typeof game.image === "string" ? game.image : game.image.src;
            const steamData = steamReviews[game.appId];

            return (
              <article
                key={game.id}
                className={`group w-[280px] sm:w-[330px] md:w-[350px] shrink-0 snap-start relative flex flex-col justify-between overflow-hidden border-2 bg-paper transition-all duration-200 hover:-translate-y-1 shadow-sm ${isVoted
                  ? "border-seal shadow-[4px_4px_0_0_oklch(0.556_0.216_27.5)]"
                  : "border-ink/20 hover:border-ink"
                  }`}
              >
                {isVoted && (
                  <div className="seal-stamp absolute top-2.5 right-2.5 z-20 border-2 border-seal bg-paper/90 px-2.5 py-0.5 font-mono text-[11px] font-bold text-seal backdrop-blur-md">
                    1 ★ VERİLDİ
                  </div>
                )}

                <div>
                  <div className="relative h-[135px] sm:h-[150px] w-full overflow-hidden bg-ink/10">
                    <img
                      src={imageSrc}
                      alt={`${game.title} afiş görseli`}
                      loading="lazy"
                      width={1088}
                      height={608}
                      className="size-full object-cover transition-all duration-300 group-hover:grayscale"
                    />
                    <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5 bg-ink/85 px-1.5 py-0.5 font-mono text-[9px] text-paper backdrop-blur-sm border border-paper/10">
                      <span className="opacity-60">AppID:</span>
                      <span className="font-bold">{game.appId}</span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 pb-1 sm:pb-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 pr-1">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-mute truncate block">
                          {game.genre}
                        </span>
                        <h3 className="font-display text-base sm:text-lg uppercase tracking-tight text-ink leading-tight line-clamp-1">
                          {game.title}
                        </h3>
                      </div>
                      <div className="text-right leading-none shrink-0">
                        <div className="flex items-center justify-end gap-1">
                          <span
                            className="relative flex size-1.5"
                            title="Steam Resmi API Canlı Değeri"
                          >
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
                          </span>
                          <div className="font-mono text-lg sm:text-xl font-bold tabular-nums text-seal">
                            {steamData ? `${steamData.star_rating} ★` : "1.0 ★"}
                          </div>
                        </div>
                        <div className="font-mono text-[9px] uppercase text-seal font-semibold mt-0.5">
                          {steamData ? `${tr(steamData.total_negative)} olumsuz` : "Canlı Steam"}
                        </div>
                      </div>
                    </div>

                    {/* Steam Rating Breakdown */}
                    <div className="mt-1.5">
                      <SteamRatingDisplay steam={steamData} />
                    </div>

                    <div className="mt-2 border-t border-ink/15 pt-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-mute">
                          İnceleme Platformları:
                        </span>
                        <span className="font-mono text-[9px] text-mute">
                          {game.platforms.length} Platform
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-1">
                        {game.platforms.map((p) => {
                          const stampKey = `${game.id}-${p.id}`;
                          const isStamped = stampedPlatforms.includes(stampKey);

                          return (
                            <a
                              key={p.id}
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                playStampSound();
                                toggleStampPlatform(stampKey);
                              }}
                              className={`group inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors ${isStamped
                                ? "border-seal bg-seal/10 text-seal font-bold"
                                : "border-ink/20 bg-paper text-ink hover:border-ink hover:bg-ink hover:text-paper"
                                }`}
                              title={`${p.name} - ${p.actionHint}`}
                            >
                              <span>{p.shortName}</span>
                              <ExternalLink className="size-2 opacity-60 group-hover:opacity-100" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenGamePlatforms(game)}
                    className="inline-flex w-full items-center justify-center gap-2 bg-seal px-3 py-2 font-mono text-xs uppercase tracking-wider font-bold text-paper transition-all shadow-md active:translate-y-px hover:brightness-110"
                  >
                    <Flame className="size-3.5 animate-bounce" />
                    <span>Tüm Platformlarda 1★ Ver ({game.platforms.length})</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* All Paradox Games Publisher Hub Banner */}
        <div className="mt-8 border-2 border-dashed border-ink/30 bg-paper p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors hover:border-ink">
          <div className="max-w-[65ch]">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-seal font-bold">
              <span className="size-2 rounded-full bg-seal" />
              Tüm Paradox Kataloğu (100+ Oyun & DLC)
            </div>
            <h3 className="mt-1 font-display text-xl sm:text-2xl uppercase tracking-tight">
              Sadece Bu {GAMES.length} Oyun Değil, Şirketin Tüm Kataloğu
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-mute leading-relaxed">
              Paradox Interactive bünyesinde <strong>Age of Wonders 4, Prison Architect, Surviving Mars, Magicka, Crusader Kings II</strong> ve yüzlerce genişleme paketi (DLC) yer alıyor. Steam ve Epic Games yayıncı merkezinden tüm oyunlara ulaşıp boykotu genişletebilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="https://store.steampowered.com/publisher/paradoxinteractive"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-paper transition-colors hover:bg-seal hover:border-seal"
            >
              <span>Steam Tüm Oyunlar (100+)</span>
              <ExternalLink className="size-3.5" />
            </a>
            <a
              href="https://store.epicgames.com/tr/browse?q=Paradox%20Interactive"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-ink/30 bg-paper px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:border-ink"
            >
              <span>Epic Games Kataloğu</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Incident Summary & Demands */}
      <section className="mx-auto max-w-[1240px] px-5 py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-ink pb-4">
          <h2 className="font-display text-3xl tracking-tight uppercase sm:text-4xl">
            Olay Nasıl Gelişti?
          </h2>
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-seal hover:underline"
          >
            <span>OdaTV Haberi & Kaynak</span>
            <ExternalLink className="size-3" />
          </a>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="border-2 border-ink/20 bg-paper p-5 transition-colors hover:border-ink">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-seal">
              (A) Profil Fotoğrafı & 1915 İftirası
            </div>
            <h3 className="mt-2 font-display text-2xl uppercase leading-none">
              Moderatör 'chakerathe' İftirası
            </h3>
            <p className="mt-3 text-sm text-mute leading-relaxed">
              Resmi HOI4 Discord'unda Atatürk portresini profil fotoğrafı yapan Türk oyuncu banlandı. İtiraz talebinde moderatör <strong>'chakerathe'</strong>, Atatürk'ü İttihat ve Terakki ile bağdaştırıp 1915 olayları üzerinden açıkça <strong>soykırımcı iftirası</strong> attı ve fotoğrafı kaldırmazsa banın kalkmayacağını söyledi.
            </p>
          </div>

          <div className="border-2 border-ink/20 bg-paper p-5 transition-colors hover:border-ink">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-seal">
              (B) Çifte Standart & Sansür
            </div>
            <h3 className="mt-2 font-display text-2xl uppercase leading-none">
              Stalin Serbest, Atatürk Yasak
            </h3>
            <p className="mt-3 text-sm text-mute leading-relaxed">
              Sunucuda Stalin ve Churchill fotoğraflarına izin verilirken; 1915'te Çanakkale'de cephede vatan savunan Atatürk'e atılan bu iftiraya itiraz eden ve gerçeği anlatan Türk oyuncular, sunucu yetkilileri tarafından susturuldu ve kitlesel olarak banlandı.
            </p>
          </div>

          <div className="border-2 border-ink/20 bg-paper p-5 transition-colors hover:border-ink">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-seal">
              (C) Topluluk Cevabı
            </div>
            <h3 className="mt-2 font-display text-2xl uppercase leading-none">
              Tüm Cephelerde Boykot
            </h3>
            <p className="mt-3 text-sm text-mute leading-relaxed">
              Tarihçi Prof. Dr. Emrah Safa Gürkan 6000+ saatlik oyun kütüphanesini silerek tepki gösterdi. Yalnızca HOI4 değil; Paradox'un tüm oyunları, Trustpilot kurumsal sayfası ve Google Maps profili 1 yıldız veriliyor.
            </p>
          </div>
        </div>

        {/* 4 Demands Banner */}
        <div className="mt-12 border-2 border-ink bg-paper p-6 sm:p-8">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-seal">
            <Award className="size-4" />
            Topluluğun Net 4 Talebi
          </div>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl uppercase tracking-tight">
            Paradox Interactive Ne Yapmalı?
          </h3>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEMANDS.map((demand) => (
              <div key={demand.number} className="border border-ink/15 p-4 bg-ink/5">
                <span className="font-mono text-2xl font-bold text-seal">{demand.number}</span>
                <h4 className="mt-1 font-display text-lg uppercase tracking-tight">{demand.title}</h4>
                <p className="mt-2 text-xs text-mute leading-relaxed">{demand.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Petition Campaign Section */}
      <PetitionSection />

      {/* Corporate Targets Section (Trustpilot, Google, Metacritic Publisher) */}
      <CorporateTargetsSection
        stampedIds={stampedPlatforms}
        onToggleStamp={toggleStampPlatform}
      />

      {/* Direct X / Twitter Pressure Center on Paradox CEO & Company */}
      <CeoRaidSection />

      {/* Shareholder Financial Pressure Center */}
      <ShareholderMailSection />

      {/* Direct Mail to Paradox PR & Licensing */}
      <DirectMailSection />

      {/* Ready-to-copy Review Templates */}
      <ReviewTemplatesSection />

      {/* Anti-Spam / Anti-Review Bombing Guidelines */}
      <AntiSpamGuideSection />

      {/* Action Guides: Steam Refund, Discord Report & Avatar Protest Kit */}
      <BoycottGuidesSection />

      {/* FAQ & AEO / GEO Bilgi Merkezi */}
      <FaqSection />

      {/* News & Media Sources */}
      <NewsSourcesSection />

      {/* Footer / Sesini Duyur & Kampanyayı Yay */}
      <footer className="mt-14 border-t-2 border-ink bg-paper pt-12 pb-16">
        <div className="mx-auto max-w-[1240px] px-5">
          <ShareBar />
          
          <div className="mt-10 pt-6 border-t border-ink/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-mute">
            <div className="text-center sm:text-left">
              © 2026 Bağımsız Türk Oyuncu Topluluğu İnisiyatifi · <span className="text-seal font-bold">#BoycottParadox</span>
            </div>
            <div className="text-center sm:text-right text-ink/70">
              Gazi Mustafa Kemal Atatürk'ün aziz hatırasına saygıyla. 🇹🇷
            </div>
          </div>
        </div>
      </footer>

      {/* Bulk Launcher Modal */}
      <BulkLauncherModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        stampedIds={stampedPlatforms}
        onToggleStamp={toggleStampPlatform}
        onMarkStamped={markPlatformAsStamped}
      />

    </div>
  );
}
