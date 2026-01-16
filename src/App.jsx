import { useMemo, useState } from "react";
import "./App.css";
import { Heart, Menu, Search, Sparkles, Shirt, BarChart3 } from "lucide-react";

const initialClothing = [
  {
    id: 1,
    name: "Sky Knit Pullover",
    category: "Knit",
    design_img_url: "/image1.jpeg",
    size_specs: { shoulder: 46, chest: 104, waist: 90 },
  },
  {
    id: 2,
    name: "Rose Short Jacket",
    category: "Jacket",
    design_img_url: "/image2.jpeg",
    size_specs: { shoulder: 42, chest: 96, waist: 86 },
  },
  {
    id: 3,
    name: "Chestnut Blazer",
    category: "Jacket",
    design_img_url: "/image3.jpeg",
    size_specs: { shoulder: 44, chest: 102, waist: 92 },
  },
  {
    id: 4,
    name: "Oat Knit Sweater",
    category: "Knit",
    design_img_url: "/image4.jpeg",
    size_specs: { shoulder: 48, chest: 106, waist: 94 },
  },
  {
    id: 5,
    name: "Midnight Puffer",
    category: "Outerwear",
    design_img_url: "/image5.jpeg",
    size_specs: { shoulder: 50, chest: 114, waist: 106 },
  },
  {
    id: 6,
    name: "Cloud Belt Coat",
    category: "Coat",
    design_img_url: "/image6.png",
    size_specs: { shoulder: 46, chest: 108, waist: 100 },
  },
  {
    id: 7,
    name: "Ink Slip Dress",
    category: "Dress",
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
    parent_id: null,
    is_creator: false,
  },
  {
    id: 2,
    clothing_id: 2,
    user: "creator.test",
    rating: 5,
    text: "테스트 답변입니다. 의견 감사합니다.",
    parent_id: 1,
    is_creator: true,
  },
  {
    id: 3,
    clothing_id: 3,
    user: "tester.two",
    rating: 4,
    text: "허리 라인을 조금 수정하면 좋겠습니다.",
    parent_id: null,
    is_creator: false,
  },
  {
    id: 4,
    clothing_id: 3,
    user: "creator.test",
    rating: 5,
    text: "다음 샘플에서 반영하겠습니다.",
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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function App() {
  const [activeTab, setActiveTab] = useState("discover");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [fundings, setFundings] = useState(initialFunding);
  const [clothing, setClothing] = useState(initialClothing);
  const [comments] = useState(initialComments);
  const [detailItem, setDetailItem] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");
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

  const fundingsFeed = useMemo(() => {
    return [...fundings]
      .filter((item) => item.status === "FUNDING")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [fundings]);

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
    if (selectedCategory === "All") {
      return fundingsFeed;
    }
    return fundingsFeed.filter(
      (item) => clothingMap[item.clothing_id]?.category === selectedCategory
    );
  }, [fundingsFeed, clothingMap, selectedCategory]);

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
        return {
          ...item,
          liked: nextLiked,
          likes: item.likes + (nextLiked ? 1 : -1),
        };
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

  return (
    <div className={`app ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      <aside className="sidebar">
        <button
          className="menu-btn sidebar-toggle"
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          <span />
          <span />
          <span />
        </button>
        <button
          className="brand"
          type="button"
          onClick={() => {
            setActiveTab("discover");
            setDetailItem(null);
          }}
        >
          <span className="brand-mark">Motif</span>
          <span className="brand-sub">Modify Your Mode</span>
        </button>
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
            // 만약 프로필도 필요하다면!
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
          <button className="ghost" type="button">
            <span className="nav-label">Settings</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6" />
              <path d="M16 16l4 4" />
            </svg>
            <input
              type="text"
              placeholder="Search brands, creators, items..."
            />
          </div>
          <div className="top-actions">
            <button
              className="icon-btn"
              type="button"
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 16h12l-1.6-2.6V9a4.4 4.4 0 0 0-8.8 0v4.4L6 16z" />
                <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
              </svg>
            </button>
            <button className="icon-btn" type="button" aria-label="Profile">
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

            <div className="feed-grid">
              {filteredFundings.slice(0, 3).map((item, index) => {
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
                        <span className="like-count">{item.likes}</span>
                      </div>
                      <div className="card-overlay" aria-hidden="true">
                        <div className="overlay-heart">
                          <Heart size={20} strokeWidth={1.5} />
                        </div>
                        <div className="overlay-cta">
                          <span>Quick Try-on</span>
                        </div>
                      </div>
                    </button>
                    <div className="card-body">
                      <div className="card-title">
                        <h3>{item.brand}</h3>
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
                    <img
                      src={detailItem.clothing?.design_img_url}
                      alt="detail"
                    />
                    <div>
                      {detailTab === "overview" && (
                        <div className="detail-block">
                          <h4>브랜드 개요</h4>
                          <p>
                            현대적 미니멀리즘을 추구하는 프리미엄 브랜드입니다.
                            지속 가능한 소재와 실험적 패턴으로 투자를
                            유도합니다.
                          </p>
                          <button
                            type="button"
                            className="primary"
                            onClick={() => handleTryOn(detailItem.clothing?.id)}
                          >
                            내 사진에 입혀보기
                          </button>
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
                        </div>
                      )}
                      {detailTab === "story" && (
                        <div className="detail-block">
                          <h4>스토리</h4>
                          <p>
                            디자인 콘셉트는 정제된 테일러링과 도시적인
                            대비입니다. 이번 컬렉션은 장인 정신과 AI 기반
                            데이터가 결합된 하이브리드 제작을 목표로 합니다.
                          </p>
                          <div className="story-meta">
                            <div>
                              <span>목표 금액</span>
                              <strong>
                                {currency.format(
                                  detailItem.funding.goal_amount
                                )}
                              </strong>
                            </div>
                            <div>
                              <span>현재 모집</span>
                              <strong>
                                {currency.format(
                                  detailItem.funding.current_amount
                                )}
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}
                      {detailTab === "feedback" && (
                        <div className="detail-block">
                          <h4>소셜 피드백</h4>
                          <div className="comment-list">
                            {comments
                              .filter(
                                (comment) =>
                                  comment.clothing_id ===
                                  detailItem.clothing?.id
                              )
                              .map((comment) => (
                                <div key={comment.id} className="comment">
                                  <div className="comment-header">
                                    <strong>@{comment.user}</strong>
                                    <span>{ratingStars(comment.rating)}</span>
                                  </div>
                                  <p>{comment.text}</p>
                                  {comment.parent_id && comment.is_creator && (
                                    <span className="label">
                                      창작자 공식 답변
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
                <h2>Digital Closet</h2>
                <span>{clothing.length} items</span>
              </div>
              <div className="closet-grid">
                {clothing.map((item) => (
                  <div
                    key={item.id}
                    className={`closet-card ${
                      focusClothingId === item.id ? "selected" : ""
                    }`}
                  >
                    <img src={item.design_img_url} alt={item.name} />
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.category}</span>
                    </div>
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

