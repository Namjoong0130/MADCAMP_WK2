import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  Heart,
  Menu,
  Search,
  Sparkles,
  Shirt,
  BarChart3,
  Filter,
  User,
} from "lucide-react";

const initialClothing = [
  {
    id: 1,
    name: "Sky Knit Pullover",
    category: "Knit",
    gender: "Womens",
    style: "Minimal",
    price: 129000,
    design_img_url: "/image1.jpeg",
    size_specs: { shoulder: 46, chest: 104, waist: 90 },
  },
  {
    id: 2,
    name: "Rose Short Jacket",
    category: "Jacket",
    gender: "Womens",
    style: "Romantic",
    price: 189000,
    design_img_url: "/image2.jpeg",
    size_specs: { shoulder: 42, chest: 96, waist: 86 },
  },
  {
    id: 3,
    name: "Chestnut Blazer",
    category: "Jacket",
    gender: "Mens",
    style: "Classic",
    price: 219000,
    design_img_url: "/image3.jpeg",
    size_specs: { shoulder: 44, chest: 102, waist: 92 },
  },
  {
    id: 4,
    name: "Oat Knit Sweater",
    category: "Knit",
    gender: "Unisex",
    style: "Minimal",
    price: 149000,
    design_img_url: "/image4.jpeg",
    size_specs: { shoulder: 48, chest: 106, waist: 94 },
  },
  {
    id: 5,
    name: "Midnight Puffer",
    category: "Outerwear",
    gender: "Unisex",
    style: "Street",
    price: 279000,
    design_img_url: "/image5.jpeg",
    size_specs: { shoulder: 50, chest: 114, waist: 106 },
  },
  {
    id: 6,
    name: "Cloud Belt Coat",
    category: "Coat",
    gender: "Womens",
    style: "Classic",
    price: 249000,
    design_img_url: "/image6.png",
    size_specs: { shoulder: 46, chest: 108, waist: 100 },
  },
  {
    id: 7,
    name: "Ink Slip Dress",
    category: "Dress",
    gender: "Womens",
    style: "Romantic",
    price: 159000,
    design_img_url: "/image7.png",
    size_specs: { shoulder: 36, chest: 82, waist: 66 },
  },
];

const initialFunding = [
  {
    id: 1,
    clothing_id: 1,
    brand: "SKYLINE",
    designer_handle: "@skyline.designer",
    participant_count: 234,
    likes: 128,
    liked: false,
    status: "FUNDING",
    goal_amount: 2200000,
    current_amount: 860000,
    created_at: "2026-02-04",
  },
  {
    id: 2,
    clothing_id: 2,
    brand: "ROSE FORM",
    designer_handle: "@rose.form",
    participant_count: 312,
    likes: 256,
    liked: false,
    status: "FUNDING",
    goal_amount: 2600000,
    current_amount: 1120000,
    created_at: "2026-02-03",
  },
  {
    id: 3,
    clothing_id: 3,
    brand: "CHESTNUT LAB",
    designer_handle: "@chestnut.lab",
    participant_count: 198,
    likes: 94,
    liked: false,
    status: "FUNDING",
    goal_amount: 3200000,
    current_amount: 980000,
    created_at: "2026-02-02",
  },
  {
    id: 4,
    clothing_id: 4,
    brand: "OAT EDITION",
    designer_handle: "@oat.edition",
    participant_count: 156,
    likes: 73,
    liked: false,
    status: "FUNDING",
    goal_amount: 1800000,
    current_amount: 760000,
    created_at: "2026-02-01",
  },
  {
    id: 5,
    clothing_id: 5,
    brand: "MIDNIGHT",
    designer_handle: "@midnight.lab",
    participant_count: 421,
    likes: 312,
    liked: false,
    status: "FUNDING",
    goal_amount: 4800000,
    current_amount: 2140000,
    created_at: "2026-01-30",
  },
  {
    id: 6,
    clothing_id: 6,
    brand: "CLOUD LINE",
    designer_handle: "@cloud.line",
    participant_count: 289,
    likes: 188,
    liked: false,
    status: "FUNDING",
    goal_amount: 5400000,
    current_amount: 2460000,
    created_at: "2026-01-28",
  },
  {
    id: 7,
    clothing_id: 7,
    brand: "INK ATELIER",
    designer_handle: "@ink.atelier",
    participant_count: 173,
    likes: 142,
    liked: false,
    status: "FUNDING",
    goal_amount: 2100000,
    current_amount: 940000,
    created_at: "2026-01-26",
  },
];

const initialComments = [
  {
    id: 1,
    clothing_id: 2,
    user: "tester.one",
    rating: 5,
    text: "테스트 코멘트입니다. 핏이 괜찮아요.",
    created_at: "2026-02-03",
    parent_id: null,
    is_creator: false,
  },
  {
    id: 2,
    clothing_id: 2,
    user: "creator.test",
    rating: 5,
    text: "테스트 답변입니다. 의견 감사합니다.",
    created_at: "2026-02-03",
    parent_id: 1,
    is_creator: true,
  },
  {
    id: 3,
    clothing_id: 3,
    user: "tester.two",
    rating: 4,
    text: "허리 라인을 조금 수정하면 좋겠습니다.",
    created_at: "2026-02-02",
    parent_id: null,
    is_creator: false,
  },
  {
    id: 4,
    clothing_id: 3,
    user: "creator.test",
    rating: 5,
    text: "다음 샘플에서 반영하겠습니다.",
    created_at: "2026-02-02",
    parent_id: 3,
    is_creator: true,
  },
];

const mannequins = [
  { id: "slim", label: "Slim", desc: "긴 실루엣, 얇은 어깨" },
  { id: "athletic", label: "Athletic", desc: "균형 잡힌 체형" },
  { id: "plus", label: "Plus-size", desc: "볼륨감 강조" },
];

const initialInvestments = [
  {
    id: 1,
    brand: "TEST STUDIO",
    amount: 150000,
    status: "성공 - 제작 중",
    eta: "2026-02-20",
  },
  {
    id: 2,
    brand: "TEST ESSENCE",
    amount: 90000,
    status: "배송 준비",
    eta: "2026-02-10",
  },
  {
    id: 3,
    brand: "TEST HERITAGE",
    amount: 240000,
    status: "배송 완료",
    eta: "2026-01-05",
  },
];

const initialBrands = [
  {
    id: 1,
    brand: "TEST ATELIER",
    participantCount: 72,
    currentCoin: 980000,
    production_note: "테스트 메모: 원단 수급 중",
    progress: 0.58,
  },
  {
    id: 2,
    brand: "TEST LAB",
    participantCount: 34,
    currentCoin: 420000,
    production_note: "테스트 메모: 샘플 제작",
    progress: 0.32,
  },
];

const userBase = {
  name: "Test User",
  handle: "@test.user",
  followerCount: 128,
  followingCount: 64,
  base_photo_url: "/image1.jpg",
  measurements: {
    shoulderWidth: 41,
    chestCircum: 86,
    waistCircum: 64,
    hipCircum: 90,
  },
  bodyTypeLabel: "Athletic",
  updatedAt: "2026-01-14",
};

const initialFittingHistory = [
  {
    id: 1,
    title: "Layering Set 01",
    image: "/image2.jpg",
    date: "2026-01-10",
  },
  {
    id: 2,
    title: "Minimal Study",
    image: "/image3.jpg",
    date: "2026-01-08",
  },
];

const currency = new Intl.NumberFormat("ko-KR");

const ratingStars = (rating) =>
  `${"★".repeat(rating)}${"☆".repeat(Math.max(0, 5 - rating))}`;

const formatDate = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatRelative = (value) => {
  const now = Date.now();
  const then = new Date(value).getTime();
  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}개월 전`;
  const years = Math.floor(months / 12);
  return `${years}년 전`;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function App() {
  const [activeTab, setActiveTab] = useState("discover");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedStyle, setSelectedStyle] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [fundings, setFundings] = useState(initialFunding);
  const [clothing, setClothing] = useState(initialClothing);
  const [comments, setComments] = useState(initialComments);
  const [detailItem, setDetailItem] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [fabric, setFabric] = useState({ stretch: 5, weight: 5, stiffness: 5 });
  const [selectedMannequin, setSelectedMannequin] = useState(mannequins[1].id);
  const [brand, setBrand] = useState({
    name: "Motif Studio",
    clothes_count: 7,
    is_public: false,
  });
  const [generatedDesigns, setGeneratedDesigns] = useState([]);
  const [studioNotice, setStudioNotice] = useState("");
  const [fittingLayers, setFittingLayers] = useState([1, 2]);
  const [pixelRatio, setPixelRatio] = useState(1);
  const [focusClothingId, setFocusClothingId] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [userProfile, setUserProfile] = useState(userBase);
  const [brands, setBrands] = useState(initialBrands);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New feedback",
      message: "@rose.form sent a comment.",
      removing: false,
    },
    {
      id: 2,
      title: "Funding update",
      message: "OAT EDITION reached 70%.",
      removing: false,
    },
  ]);
  const [commentDraft, setCommentDraft] = useState({
    rating: 5,
    text: "",
  });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentMenuId, setCommentMenuId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fundingsFeed = useMemo(() => {
    return [...fundings]
      .filter((item) => item.status === "FUNDING")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [fundings]);

  const likedClothingIds = useMemo(
    () => fundings.filter((item) => item.liked).map((item) => item.clothing_id),
    [fundings]
  );

  const closetItems = useMemo(() => {
    return clothing.filter((item) => likedClothingIds.includes(item.id));
  }, [clothing, likedClothingIds]);

  const clothingMap = useMemo(() => {
    return clothing.reduce((map, item) => {
      map[item.id] = item;
      return map;
    }, {});
  }, [clothing]);

  const categories = useMemo(() => {
    const set = new Set();
    fundingsFeed.forEach((item) => {
      const category = clothingMap[item.clothing_id]?.category;
      if (category) {
        set.add(category);
      }
    });
    return ["All", ...Array.from(set)];
  }, [fundingsFeed, clothingMap]);

  const filteredFundings = useMemo(() => {
    const filtered = fundingsFeed.filter((item) => {
      const cloth = clothingMap[item.clothing_id];
      if (!cloth) return false;
      const matchesCategory =
        selectedCategory === "All" || cloth.category === selectedCategory;
      const matchesGender =
        selectedGender === "All" || cloth.gender === selectedGender;
      const matchesStyle =
        selectedStyle === "All" || cloth.style === selectedStyle;
      return matchesCategory && matchesGender && matchesStyle;
    });
    const sorted = [...filtered];
    switch (selectedSort) {
      case "latest":
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "popular":
        sorted.sort((a, b) => b.likes - a.likes);
        break;
      case "price":
        sorted.sort((a, b) => a.goal_amount - b.goal_amount);
        break;
      default:
        break;
    }
    return sorted;
  }, [
    fundingsFeed,
    clothingMap,
    selectedCategory,
    selectedGender,
    selectedStyle,
    selectedSort,
  ]);

  const generateDesign = () => {
    const trimmed = prompt.trim();
    const nextId = Math.max(...clothing.map((item) => item.id), 0) + 1;
    const nextImage = `/image${
      ((clothing.length + generatedDesigns.length) % 7) + 1
    }.jpg`;
    const newDesign = {
      id: nextId,
      name: trimmed || `AI 컨셉 ${nextId}`,
      category: "Concept",
      design_img_url: nextImage,
      gender: "Unisex",
      style: "Minimal",
      price: 169000,
      size_specs: { shoulder: 44, chest: 98, waist: 82 },
      design_prompt: trimmed || "미니멀 테일러링 실루엣",
    };

    setClothing((prev) => [...prev, newDesign]);
    setGeneratedDesigns((prev) => [newDesign, ...prev]);
    setBrand((prev) => ({ ...prev, clothes_count: prev.clothes_count + 1 }));
    setPrompt("");
    setStudioNotice("AI 디자인이 생성되었습니다. 소재 값을 조정해보세요.");
  };

  const handleLaunch = () => {
    if (brand.is_public) {
      setStudioNotice("이미 런칭된 브랜드입니다.");
      return;
    }
    if (brand.clothes_count < 10) {
      setStudioNotice("브랜드 런칭은 최소 10개의 디자인이 필요합니다.");
      return;
    }

    const latestDesign = generatedDesigns[0] || clothing[0];
    const newFunding = {
      id: Math.max(...fundings.map((item) => item.id), 0) + 1,
      clothing_id: latestDesign.id,
      brand: brand.name.toUpperCase(),
      status: "FUNDING",
      goal_amount: 6000000,
      current_amount: 150000,
      created_at: formatDate(new Date()),
    };

    setFundings((prev) => [newFunding, ...prev]);
    setBrand((prev) => ({ ...prev, is_public: true }));
    setStudioNotice("Discover 탭으로 전송되었습니다.");
  };

  const handleTryOn = (clothingId) => {
    setActiveTab("fitting");
    setFocusClothingId(clothingId);
    setFittingLayers((prev) =>
      prev.includes(clothingId) ? prev : [...prev, clothingId]
    );
    setIsComposing(true);
    window.setTimeout(() => setIsComposing(false), 1200);
  };

  const handleLike = (fundingId) => {
    setFundings((prev) =>
      prev.map((item) => {
        if (item.id !== fundingId) return item;
        const nextLiked = !item.liked;
        const nextItem = {
          ...item,
          liked: nextLiked,
          likes: item.likes + (nextLiked ? 1 : -1),
        };
        setDetailItem((current) => {
          if (!current || current.funding.id !== fundingId) return current;
          return { ...current, funding: nextItem };
        });
        return nextItem;
      })
    );
  };

  const removeLayer = (clothingId) => {
    setFittingLayers((prev) => prev.filter((id) => id !== clothingId));
  };

  const moveLayer = (clothingId, direction) => {
    setFittingLayers((prev) => {
      const index = prev.indexOf(clothingId);
      if (index === -1) return prev;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  };

  const selectedForFit =
    clothingMap[focusClothingId || fittingLayers[fittingLayers.length - 1]];

  const fitAnalysis = useMemo(() => {
    if (!selectedForFit) {
      return {
        score: 0,
        message: "아이템을 선택하면 AI 매칭 점수가 계산됩니다.",
      };
    }

    const size = selectedForFit.size_specs;
    const user = userProfile.measurements;
    const shoulderDiff = Math.abs(size.shoulder - user.shoulderWidth);
    const chestDiff = Math.abs(size.chest - user.chestCircum);
    const waistDiff = Math.abs(size.waist - user.waistCircum);

    const rawScore =
      100 - shoulderDiff * 1.6 - chestDiff * 0.8 - waistDiff * 1.1;
    const score = clamp(Math.round(rawScore), 70, 98);

    const shoulderMatch = clamp(100 - shoulderDiff * 3, 80, 100);
    const waistMatch = clamp(100 - waistDiff * 2, 70, 100);

    return {
      score,
      message: `어깨는 ${shoulderMatch}% 일치하지만, 허리둘레 대비 여유가 ${waistMatch}% 수준입니다.`,
    };
  }, [selectedForFit, userProfile.measurements]);

  const updateMeasurement = (key, value) => {
    const numeric = Number(value);
    setUserProfile((prev) => ({
      ...prev,
      measurements: { ...prev.measurements, [key]: numeric },
      updatedAt: formatDate(new Date()),
      bodyTypeLabel: numeric > 95 ? "Plus" : numeric > 85 ? "Athletic" : "Slim",
    }));
  };

  const updateNote = (brandId, value) => {
    setBrands((prev) =>
      prev.map((item) =>
        item.id === brandId ? { ...item, production_note: value } : item
      )
    );
  };

  const submitComment = () => {
    const trimmed = commentDraft.text.trim();
    if (!detailItem?.clothing?.id || !trimmed) return;
    if (editingCommentId) {
      setComments((prev) =>
        prev.map((item) =>
          item.id === editingCommentId
            ? { ...item, rating: commentDraft.rating, text: trimmed }
            : item
        )
      );
    } else {
      const nextId = Math.max(0, ...comments.map((item) => item.id)) + 1;
      setComments((prev) => [
        {
          id: nextId,
          clothing_id: detailItem.clothing.id,
          user: "test.user",
          rating: commentDraft.rating,
          text: trimmed,
          created_at: formatDate(new Date()),
          parent_id: null,
          is_creator: false,
        },
        ...prev,
      ]);
    }
    setCommentDraft((prev) => ({ ...prev, text: "" }));
    setEditingCommentId(null);
  };

  const detailProgress = detailItem
    ? clamp(
        Math.round(
          (detailItem.funding.current_amount / detailItem.funding.goal_amount) *
            100
        ),
        0,
        100
      )
    : 0;

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedGender("All");
    setSelectedStyle("All");
    setFilterOpen(false);
  };

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div
      className={`app ${sidebarOpen ? "" : "sidebar-collapsed"} ${
        darkMode ? "dark" : ""
      }`}
    >
      <aside className="sidebar">
        <div className="sidebar-header">
          <button
            className="menu-btn sidebar-toggle"
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>

          <button
            className="brand"
            type="button"
            onClick={() => {
              setActiveTab("discover");
              setDetailItem(null);
              resetFilters();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span className="brand-mark">Motif</span>
            <span className="brand-sub">Modify Your Mode</span>
          </button>
        </div>
        <nav className="nav">
          {[
            {
              key: "discover",
              label: "Discover",
              icon: <Search size={20} strokeWidth={1.5} />,
            },
            {
              key: "studio",
              label: "Studio",
              icon: <Sparkles size={20} strokeWidth={1.5} />, // 별 모양 ✨
            },
            {
              key: "fitting",
              label: "My Fitting",
              icon: <Shirt size={20} strokeWidth={1.5} />, // 티셔츠 모양 👕
            },
            {
              key: "portfolio",
              label: "Portfolio",
              icon: <BarChart3 size={20} strokeWidth={1.5} />, // 세련된 차트 모양 📊
            },
          ].map((item) => (
            <button
              key={item.key}
              className={`nav-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
              type="button"
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="caption">Black / White minimal</p>
          <button
            className="ghost"
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
          >
            <span className="nav-label">Settings</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button
            className="top-logo"
            type="button"
            onClick={() => {
              setActiveTab("discover");
              setDetailItem(null);
              resetFilters();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aria-label="Go to Discover"
          >
            <img src="/logo.png" alt="Motif logo" />
          </button>
          <div className="search">
            <input
              type="text"
              placeholder="Search brands, creators, items..."
            />
            <button className="search-btn" type="button" aria-label="Search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6" />
                <path d="M16 16l4 4" />
              </svg>
            </button>
          </div>
          <div className="top-actions">
            <div className="notif-wrap">
              <button
                className="icon-btn"
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
                onClick={() => setNotificationOpen((prev) => !prev)}
              >
                {notifications.length > 0 && (
                  <span className="notif-dot" aria-hidden="true" />
                )}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 16h12l-1.6-2.6V9a4.4 4.4 0 0 0-8.8 0v4.4L6 16z" />
                  <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
                </svg>
              </button>
              {notificationOpen && (
                <div className="notif-panel" role="menu">
                  <div className="notif-header">
                    <div className="notif-title">
                      <strong>Notifications</strong>
                      <span>{notifications.length} new</span>
                    </div>
                  </div>
                  <ul>
                    {notifications.length === 0 ? (
                      <li className="notif-empty">알림이 없습니다</li>
                    ) : (
                      notifications.map((item) => (
                        <li
                          key={item.id}
                          className={item.removing ? "removing" : ""}
                        >
                          <div>
                            <strong>{item.title}</strong>
                            <span>{item.message}</span>
                          </div>
                          <button
                            className="notif-item-close"
                            type="button"
                            aria-label="Delete notification"
                            onClick={() => {
                              setNotifications((prev) =>
                                prev.map((notice) =>
                                  notice.id === item.id
                                    ? { ...notice, removing: true }
                                    : notice
                                )
                              );
                              window.setTimeout(() => {
                                setNotifications((prev) =>
                                  prev.filter((notice) => notice.id !== item.id)
                                );
                              }, 220);
                            }}
                          >
                            ×
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
            <button
              className="icon-btn"
              type="button"
              aria-label="Profile"
              onClick={() => {
                setActiveTab("profile");
                setDetailItem(null);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c2-4 14-4 16 0" />
              </svg>
            </button>
          </div>
        </header>

        {activeTab === "discover" && (
          <section className="content">
            <div className="page-title">
              <h1>Discover</h1>
              <p>Find your next signature look</p>
            </div>

            <div className="tag-row">
              <div className="tag-group">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`tag ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="filter-wrap">
                <select
                  className="sort-select"
                  value={selectedSort}
                  onChange={(event) => setSelectedSort(event.target.value)}
                >
                  <option value="recommended">추천순</option>
                  <option value="latest">최신순</option>
                  <option value="popular">인기순</option>
                  <option value="price">낮은가격순</option>
                </select>
                <button
                  className="filter-btn"
                  type="button"
                  aria-label="Filter"
                  aria-expanded={filterOpen}
                  onClick={() => setFilterOpen((prev) => !prev)}
                >
                  <Filter size={16} strokeWidth={1.8} />
                </button>
                {filterOpen && (
                  <div className="filter-panel">
                    <label className="filter-field">
                      Gender
                      <select
                        value={selectedGender}
                        onChange={(event) =>
                          setSelectedGender(event.target.value)
                        }
                      >
                        {["All", "Mens", "Womens", "Unisex"].map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="filter-field">
                      Style
                      <select
                        value={selectedStyle}
                        onChange={(event) =>
                          setSelectedStyle(event.target.value)
                        }
                      >
                        {[
                          "All",
                          "Minimal",
                          "Street",
                          "Classic",
                          "Sport",
                          "Romantic",
                        ].map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="feed-grid">
              {filteredFundings.map((item, index) => {
                const cloth = clothingMap[item.clothing_id];
                const progress = clamp(
                  Math.round((item.current_amount / item.goal_amount) * 100),
                  0,
                  100
                );

                return (
                  <article
                    className="card discover-card"
                    key={item.id}
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <button
                      type="button"
                      className="card-media"
                      onClick={() => {
                        setDetailItem({ funding: item, clothing: cloth });
                        setDetailTab("overview");
                      }}
                    >
                      <img src={cloth?.design_img_url} alt={cloth?.name} />
                      <div className="card-like">
                        <button
                          type="button"
                          className={`like-btn ${item.liked ? "liked" : ""}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleLike(item.id);
                          }}
                          aria-label="Like"
                        >
                          <Heart size={18} strokeWidth={1.6} />
                        </button>
                      </div>
                      <div className="card-overlay" aria-hidden="true"></div>
                    </button>
                    <div className="card-body">
                      <div className="card-title">
                        <div className="card-title-row">
                          <h3>{item.brand}</h3>
                          <span className="price-inline">
                            {currency.format(
                              clothingMap[item.clothing_id]?.price || 0
                            )}
                          </span>
                        </div>
                        <span className="designer-handle">
                          {item.designer_handle}
                        </span>
                      </div>
                      <div className="progress">
                        <div
                          className="progress-bar"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="progress-info">
                        <span>
                          ₩{currency.format(item.current_amount)} 달성
                        </span>
                        <span>목표 ₩{currency.format(item.goal_amount)}</span>
                      </div>
                      <div className="participant">
                        {item.participant_count}명 참여
                      </div>
                    </div>
                  </article>
                );
              })}
              {Array.from({
                length: Math.max(0, 3 - filteredFundings.slice(0, 3).length),
              }).map((_, idx) => (
                <div key={`placeholder-${idx}`} className="feed-spacer" />
              ))}
            </div>

            {detailItem && (
              <div className="modal" role="dialog" aria-modal="true">
                <div className="modal-content">
                  <button
                    className="close"
                    onClick={() => setDetailItem(null)}
                    type="button"
                  >
                    ×
                  </button>
                  <div className="modal-stack">
                    <div className="modal-header">
                      <div>
                        <h2>{detailItem.funding.brand}</h2>
                        <p>{detailItem.clothing?.name}</p>
                      </div>
                      <div className="pill-group">
                        {["overview", "story", "feedback"].map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            className={`pill ${
                              detailTab === tab ? "active" : ""
                            }`}
                            onClick={() => setDetailTab(tab)}
                          >
                            {tab === "overview" && "Overview"}
                            {tab === "story" && "Story"}
                            {tab === "feedback" && "Feedback"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="modal-body">
                      <div className="detail-media">
                        <button
                          type="button"
                          className="detail-media-btn"
                          onClick={() =>
                            setImagePreview(detailItem.clothing?.design_img_url)
                          }
                          aria-label="Expand image"
                        >
                          <img
                            src={detailItem.clothing?.design_img_url}
                            alt="detail"
                          />
                        </button>
                        <button
                          type="button"
                          className="floating-tryon"
                          onClick={() => handleTryOn(detailItem.clothing?.id)}
                        >
                          Fitting
                        </button>
                      </div>
                      <div>
                        {detailTab === "overview" && (
                          <div className="detail-block">
                            <div className="price-row">
                              <div>
                                <span className="price-label">Price</span>
                                <strong className="price-strong">
                                  {currency.format(
                                    detailItem.clothing?.price || 0
                                  )}
                                </strong>
                              </div>
                              <button
                                type="button"
                                className={`like-count-inline subtle ${
                                  detailItem.funding.liked ? "liked" : ""
                                }`}
                                aria-label="Likes"
                                onClick={() =>
                                  handleLike(detailItem.funding.id)
                                }
                              >
                                <Heart size={14} strokeWidth={1.6} />
                                {detailItem.funding.likes}
                              </button>
                            </div>
                            <h4>옷 세부내용</h4>
                            <p>
                              {detailItem.clothing?.name}은(는) 절제된 실루엣과
                              깔끔한 마감으로 일상과 포멀 모두에 어울립니다.
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <span>진행도</span>
                                <strong style={{ fontSize: "14px" }}>
                                  {detailProgress}%
                                </strong>
                              </div>

                              {/* 막대 그래프 (게이지) */}
                              <div className="detail-bar-track">
                                <div
                                  className="detail-bar-fill"
                                  style={{ width: `${detailProgress}%` }}
                                />
                              </div>
                            </div>
                            <div className="spec-grid">
                              <div>
                                <span>소재</span>
                                <strong>프리미엄 울 블렌드</strong>
                              </div>
                              <div>
                                <span>원산지</span>
                                <strong>이탈리아 / 일본</strong>
                              </div>
                              <div>
                                <span>배송 예정</span>
                                <strong>2026년 4월</strong>
                              </div>
                              <div>
                                <span>사이즈</span>
                                <strong>XS - XL</strong>
                              </div>
                            </div>
                            <div className="spec-grid">
                              {[
                                { label: "신축성", value: fabric.stretch },
                                { label: "무게감", value: fabric.weight },
                                { label: "탄탄함", value: fabric.stiffness },
                              ].map((item) => (
                                <div className="spec-card" key={item.label}>
                                  <div className="spec-card-head">
                                    <span className="spec-label">
                                      {item.label}
                                    </span>
                                    <strong className="spec-value">
                                      {item.value}/10
                                    </strong>
                                  </div>
                                  <div className="detail-bar-track">
                                    <div
                                      className="detail-bar-fill"
                                      style={{
                                        width: `${(item.value / 10) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {detailTab === "story" && (
                          <div className="detail-block">
                            <h4>브랜드 스토리</h4>
                            <p>
                              {detailItem.funding.brand}는 장인 정신과 데이터
                              기반 디자인을 결합해 지속 가능한 컬렉션을
                              선보입니다. 이번 라인업은 도시적인 실루엣과 실용적
                              디테일을 강조하며, 고객 피드백을 빠르게 반영하는
                              것을 목표로 합니다.
                            </p>
                            <div className="story-meta">
                              <div className="story-row">
                                <span>목표 금액</span>
                                <strong>
                                  {currency.format(
                                    detailItem.funding.goal_amount
                                  )}
                                </strong>
                                <div className="story-bar">
                                  <div
                                    className="story-fill"
                                    style={{ width: "100%" }}
                                  />
                                </div>
                              </div>
                              <div className="story-row">
                                <span>현재 모집</span>
                                <strong>
                                  {currency.format(
                                    detailItem.funding.current_amount
                                  )}
                                </strong>
                                <div className="story-bar">
                                  <div
                                    className="story-fill"
                                    style={{ width: `${detailProgress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {detailTab === "feedback" && (
                          <div className="detail-block">
                            <h4>소셜 피드백</h4>
                            <div className="comment-list compact">
                              {comments.filter(
                                (comment) =>
                                  comment.clothing_id ===
                                  detailItem.clothing?.id
                              ).length === 0 ? (
                                <div className="comment-empty">
                                  첫 피드백을 등록해보세요
                                </div>
                              ) : (
                                comments
                                  .filter(
                                    (comment) =>
                                      comment.clothing_id ===
                                      detailItem.clothing?.id
                                  )
                                  .map((comment) => (
                                    <div
                                      key={comment.id}
                                      className={`comment compact ${
                                        comment.parent_id && comment.is_creator
                                          ? "reply"
                                          : ""
                                      }`}
                                    >
                                      <span className="comment-rating">
                                        {ratingStars(comment.rating)}
                                      </span>
                                      <div className="comment-body">
                                        <div className="comment-meta">
                                          <div className="comment-user">
                                            <strong>@{comment.user}</strong>
                                            {comment.parent_id &&
                                              comment.is_creator && (
                                                <span className="creator-badge">
                                                  창작자
                                                </span>
                                              )}
                                          </div>
                                          <span className="comment-time">
                                            {formatRelative(
                                              comment.created_at || new Date()
                                            )}
                                          </span>
                                        </div>
                                        <span>{comment.text}</span>
                                      </div>
                                      <div className="comment-menu">
                                        <button
                                          type="button"
                                          className="comment-menu-btn"
                                          aria-label="Comment actions"
                                          onClick={() =>
                                            setCommentMenuId((prev) =>
                                              prev === comment.id
                                                ? null
                                                : comment.id
                                            )
                                          }
                                        >
                                          ⋮
                                        </button>
                                        {commentMenuId === comment.id && (
                                          <div className="comment-menu-pop">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setCommentDraft({
                                                  rating: comment.rating,
                                                  text: comment.text,
                                                });
                                                setEditingCommentId(comment.id);
                                                setCommentMenuId(null);
                                              }}
                                            >
                                              수정
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setComments((prev) =>
                                                  prev.filter(
                                                    (item) =>
                                                      item.id !== comment.id
                                                  )
                                                );
                                                setCommentMenuId(null);
                                              }}
                                            >
                                              삭제
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))
                              )}
                            </div>
                            <div className="comment-form compact">
                              <div className="comment-input-row">
                                <select
                                  value={commentDraft.rating}
                                  onChange={(event) =>
                                    setCommentDraft((prev) => ({
                                      ...prev,
                                      rating: Number(event.target.value),
                                    }))
                                  }
                                >
                                  {[5, 4, 3, 2, 1].map((value) => (
                                    <option key={value} value={value}>
                                      {ratingStars(value)}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  value={commentDraft.text}
                                  onChange={(event) =>
                                    setCommentDraft((prev) => ({
                                      ...prev,
                                      text: event.target.value,
                                    }))
                                  }
                                  placeholder="한 줄 피드백을 남겨주세요."
                                />
                              </div>
                              <button
                                type="button"
                                className="primary"
                                onClick={submitComment}
                              >
                                {editingCommentId ? "댓글 수정" : "댓글 등록"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {imagePreview && (
              <div
                className="image-modal"
                role="dialog"
                aria-modal="true"
                onClick={() => setImagePreview(null)}
              >
                <div className="image-modal-content">
                  <img src={imagePreview} alt="preview" />
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "studio" && (
          <section className="content">
            <div className="page-title">
              <h1>Studio</h1>
              <p>창작자의 작업실 - AI 디자인과 피팅 엔진을 생성합니다.</p>
            </div>

            <div className="studio-grid">
              <div className="panel">
                <h3>AI 디자인 생성</h3>
                <label className="field">
                  Design Prompt
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="미니멀한 오버사이즈 코트, 대칭적인 라펠과 깊은 블랙 톤"
                  />
                </label>
                <button
                  className="primary"
                  type="button"
                  onClick={generateDesign}
                >
                  Magic Generate
                </button>

                <div className="subsection">
                  <h4>Fabric Properties</h4>
                  {["stretch", "weight", "stiffness"].map((key) => (
                    <label key={key} className="slider">
                      <span>{key}</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={fabric[key]}
                        onChange={(event) =>
                          setFabric((prev) => ({
                            ...prev,
                            [key]: Number(event.target.value),
                          }))
                        }
                      />
                      <span>{fabric[key]}/10</span>
                    </label>
                  ))}
                </div>

                <div className="subsection">
                  <h4>마네킹 프리셋 테스트</h4>
                  <div className="pill-group">
                    {mannequins.map((mannequin) => (
                      <button
                        key={mannequin.id}
                        type="button"
                        className={`pill ${
                          selectedMannequin === mannequin.id ? "active" : ""
                        }`}
                        onClick={() => setSelectedMannequin(mannequin.id)}
                      >
                        {mannequin.label}
                      </button>
                    ))}
                  </div>
                  <div className="mannequin-card">
                    <div className="mannequin-avatar" />
                    <div>
                      <strong>
                        {
                          mannequins.find(
                            (item) => item.id === selectedMannequin
                          )?.label
                        }
                      </strong>
                      <p>
                        {
                          mannequins.find(
                            (item) => item.id === selectedMannequin
                          )?.desc
                        }
                      </p>
                      <p>Layer Order: Base → Mid → Outer</p>
                    </div>
                  </div>
                </div>

                <div className="subsection">
                  <h4>브랜드 런칭</h4>
                  <p>
                    현재 디자인 수: <strong>{brand.clothes_count} / 10</strong>
                  </p>
                  <button
                    className="secondary"
                    type="button"
                    onClick={handleLaunch}
                  >
                    Discover로 전송
                  </button>
                  {studioNotice && <p className="notice">{studioNotice}</p>}
                </div>
              </div>

              <div className="panel">
                <h3>Generated Gallery</h3>
                <div className="gallery-grid">
                  {generatedDesigns.length === 0 && (
                    <p className="empty">아직 생성된 디자인이 없습니다.</p>
                  )}
                  {generatedDesigns.map((item, index) => (
                    <div
                      key={item.id}
                      className="gallery-card"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <img src={item.design_img_url} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.design_prompt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "fitting" && (
          <section className="content">
            <div className="page-title">
              <h1>My Fitting</h1>
              <p>
                나만의 가상 드레스룸 - 레이어링과 AI 매칭을 동시에 확인합니다.
              </p>
            </div>

            <div className="fitting-layout">
              <div className="fitting-preview">
                <img src={userProfile.base_photo_url} alt="base" />
                <div
                  className="layer-stack"
                  style={{ transform: `scale(${pixelRatio})` }}
                >
                  {fittingLayers.map((id) => (
                    <img
                      key={id}
                      src={clothingMap[id]?.design_img_url}
                      alt="layer"
                    />
                  ))}
                </div>
                {isComposing && <div className="compose">AI 합성 중...</div>}
              </div>

              <div className="fitting-panel">
                <div className="panel-block">
                  <h3>레이어링 피팅</h3>
                  <div className="layer-list">
                    {fittingLayers.map((id, index) => (
                      <div key={id} className="layer-item">
                        <span>
                          {index + 1}. {clothingMap[id]?.name}
                        </span>
                        <div>
                          <button
                            type="button"
                            onClick={() => moveLayer(id, "up")}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveLayer(id, "down")}
                          >
                            ↓
                          </button>
                          <button type="button" onClick={() => removeLayer(id)}>
                            제거
                          </button>
                        </div>
                      </div>
                    ))}
                    {fittingLayers.length === 0 && (
                      <p>현재 레이어가 비어 있습니다.</p>
                    )}
                  </div>
                </div>

                <div className="panel-block">
                  <h3>AI 매칭 점수</h3>
                  <div className="score">
                    <strong>{fitAnalysis.score}</strong>
                    <span>점</span>
                  </div>
                  <p>{fitAnalysis.message}</p>
                </div>

                <div className="panel-block">
                  <h3>대표 사진 스케일</h3>
                  <label className="slider">
                    <span>pixelRatio</span>
                    <input
                      type="range"
                      min="0.8"
                      max="1.2"
                      step="0.02"
                      value={pixelRatio}
                      onChange={(event) =>
                        setPixelRatio(Number(event.target.value))
                      }
                    />
                    <span>{pixelRatio.toFixed(2)}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="closet">
              <div className="closet-header">
                <h2>My Closet</h2>
                <span>{closetItems.length} items</span>
              </div>
              <div className="closet-grid">
                {closetItems.map((item) => (
                  <div
                    key={item.id}
                    className={`closet-card ${
                      focusClothingId === item.id ? "selected" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="closet-remove"
                      aria-label="Remove from closet"
                      onClick={() => {
                        setFundings((prev) =>
                          prev.map((funding) =>
                            funding.clothing_id === item.id
                              ? {
                                  ...funding,
                                  liked: false,
                                  likes: Math.max(0, funding.likes - 1),
                                }
                              : funding
                          )
                        );
                      }}
                    >
                      ×
                    </button>
                    <button
                      type="button"
                      className="closet-link"
                      onClick={() => {
                        const funding = fundings.find(
                          (entry) => entry.clothing_id === item.id
                        );
                        if (!funding) return;
                        setActiveTab("discover");
                        setDetailItem({ funding, clothing: item });
                        setDetailTab("overview");
                      }}
                    >
                      <img src={item.design_img_url} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        setFocusClothingId(item.id);
                        setFittingLayers((prev) =>
                          prev.includes(item.id) ? prev : [...prev, item.id]
                        );
                      }}
                    >
                      레이어 추가
                    </button>
                  </div>
                ))}
                {closetItems.length === 0 && (
                  <p className="closet-empty">좋아요한 아이템이 없습니다.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "portfolio" && (
          <section className="content">
            <div className="page-title">
              <h1>Portfolio</h1>
              <p>나의 패션 자산 대시보드 - 투자와 창작 기록을 관리합니다.</p>
            </div>

            <div className="portfolio-grid">
              <div className="panel">
                <h3>My Brands (Investee)</h3>
                <div className="chart">
                  {brands.map((item) => (
                    <div key={item.id} className="chart-row">
                      <span>{item.brand}</span>
                      <div className="chart-bar">
                        <div style={{ width: `${item.progress * 100}%` }} />
                      </div>
                      <span>{Math.round(item.progress * 100)}%</span>
                    </div>
                  ))}
                </div>
                <div className="brand-list">
                  {brands.map((item) => (
                    <div key={item.id} className="brand-card">
                      <div>
                        <strong>{item.brand}</strong>
                        <p>
                          참여 {item.participantCount}명 · \
                          {currency.format(item.currentCoin)}
                        </p>
                      </div>
                      <textarea
                        value={item.production_note}
                        onChange={(event) =>
                          updateNote(item.id, event.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <h3>My Investments (Investor)</h3>
                <div className="investment-list">
                  {initialInvestments.map((item) => (
                    <div key={item.id} className="investment-card">
                      <div>
                        <strong>{item.brand}</strong>
                        <p>\{currency.format(item.amount)}</p>
                      </div>
                      <span className="status">{item.status}</span>
                      <span className="eta">예상 배송: {item.eta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "profile" && (
          <section className="content">
            <div className="page-title">
              <h1>Profile</h1>
              <p>프로필 설정과 피팅 이력을 관리합니다.</p>
            </div>

            <div className="profile-grid">
              <div className="panel">
                <h3>체형 변경 및 이력 관리</h3>
                <div className="measurement-grid">
                  {Object.entries(userProfile.measurements).map(
                    ([key, value]) => (
                      <label key={key} className="field">
                        {key}
                        <input
                          type="number"
                          value={value}
                          onChange={(event) =>
                            updateMeasurement(key, event.target.value)
                          }
                        />
                      </label>
                    )
                  )}
                </div>
                <div className="meta">
                  <span>Updated: {userProfile.updatedAt}</span>
                  <span>Body Label: {userProfile.bodyTypeLabel}</span>
                </div>
              </div>

              <div className="panel">
                <h3>Fitting Album</h3>
                <div className="album">
                  {initialFittingHistory.map((item) => (
                    <div key={item.id} className="album-card">
                      <img src={item.image} alt={item.title} />
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
