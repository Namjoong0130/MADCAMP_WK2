import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import MyFitting from "./pages/MyFitting";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls } from "@react-three/drei";
import {
  login,
  signup,
  getProfile,
  updateBodyMetrics,
  deleteAccount,
  uploadProfilePhoto
} from "./api/auth";
import {
  getPublicBrands,
  getBrandProfiles,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandLogo,
  getClothes,
  getFundingFeed,
  getUserInvestments,
  getMyFittings,
  getDesignHistory
} from "./api/services";
import Tshirt from "./Tshirt";
import {
  initialClothing,
  initialFunding,
  initialComments,
  initialInvestments,
  initialBrands,
  userBase,
  initialFittingHistory,
  brandProfiles as initialBrandProfiles,
} from "./data/seedData";
import {
  currency,
  formatDate,
  formatRelative,
  clamp,
} from "./utils/formatters";
import {
  Heart,
  Menu,
  Search,
  Sparkles,
  Shirt,
  BarChart3,
  Filter,
  User,
  Pencil,
  Eraser,
  Trash2,
} from "lucide-react";

const buildDefaultBrandDetails = (brandName) => ({
  brand: brandName.toUpperCase(),
  handle: "@motif.studio",
  bio: "브랜드 소개를 추가해보세요.",
  location: "Seoul",
  logoUrl: "/logo.png",
});

const buildEmptyBrandDetails = () => ({
  brand: "이름을 입력해주세요.",
  handle: "",
  bio: "소개를 입력해주세요.",
  location: "지역을 입력해주세요.",
  logoUrl: "",
});

const brandPlaceholders = {
  brand: "이름을 입력해주세요.",
  bio: "소개를 입력해주세요.",
};

const getBackendBaseUrl = () => {
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_PROXY_TARGET
  ) {
    return import.meta.env.VITE_API_PROXY_TARGET;
  }
  return "";
};

const normalizeAssetUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  const base = getBackendBaseUrl();
  return base ? `${base}${value}` : value;
};

function App() {
  const [activeTab, setActiveTab] = useState("discover");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
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
  const [aiFileName, setAiFileName] = useState(null);
  const [brand, setBrand] = useState({
    name: "Motif Studio",
    clothes_count: 7,
    is_public: false,
  });
  const [generatedDesigns, setGeneratedDesigns] = useState([]);
  const [fittingLayers, setFittingLayers] = useState([]);
  const [fittingLayersDraft, setFittingLayersDraft] = useState([]);
  const [focusClothingId, setFocusClothingId] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [fittingView, setFittingView] = useState("3d");
  const [fittingZoom, setFittingZoom] = useState(0.9);
  const [fittingRealBaseUrl, setFittingRealBaseUrl] = useState("/image7.png");
  const [userProfile, setUserProfile] = useState(userBase);
  const [brands, setBrands] = useState(initialBrands);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedBrandKey, setSelectedBrandKey] = useState(null);
  const [followedBrands, setFollowedBrands] = useState([]);
  const [brandProfiles, setBrandProfiles] = useState(initialBrandProfiles);
  const [hasBrandPage, setHasBrandPage] = useState(false);
  const [brandPageReady, setBrandPageReady] = useState(false);
  const [brandFollowerOverride, setBrandFollowerOverride] = useState(null);
  const [myBrandId, setMyBrandId] = useState(null);
  const [fittingAlbumOpen, setFittingAlbumOpen] = useState(false);
  const [portfolioTab, setPortfolioTab] = useState("investee");
  const [investments, setInvestments] = useState(initialInvestments);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [brandEditing, setBrandEditing] = useState(false);
  const [portfolioListOpen, setPortfolioListOpen] = useState(null);
  const [brandFundingOpen, setBrandFundingOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, mode: null });
  const [cancelFundingModal, setCancelFundingModal] = useState({
    open: false,
    investmentId: null,
  });
  const [brandCreatePromptOpen, setBrandCreatePromptOpen] = useState(false);
  const [brandPageRequiredOpen, setBrandPageRequiredOpen] = useState(false);
  const [brandDeleteConfirmOpen, setBrandDeleteConfirmOpen] = useState(false);
  const [accountDeleteConfirmOpen, setAccountDeleteConfirmOpen] =
    useState(false);
  const [nameModal, setNameModal] = useState({
    open: false,
    type: null,
    value: "",
    view: null,
  });
  const [limitAlertOpen, setLimitAlertOpen] = useState(false);
  const [limitAlertMessage, setLimitAlertMessage] = useState("");
  const [aiDesignModal, setAiDesignModal] = useState({
    open: false,
    design: null,
  });
  const [designCoins, setDesignCoins] = useState(6);
  const [designCoinModal, setDesignCoinModal] = useState(false);
  const [designCoinAlertOpen, setDesignCoinAlertOpen] = useState(false);
  const [designCoinAlertClosing, setDesignCoinAlertClosing] = useState(false);
  const [designGenerateConfirmOpen, setDesignGenerateConfirmOpen] =
    useState(false);
  const [designPhoto, setDesignPhoto] = useState(null);
  const designPhotoInputRef = useRef(null);
  const aiPhotoInputRef = useRef(null);
  const fittingCanvasRef = useRef(null);
  const [alreadyFundedAlertOpen, setAlreadyFundedAlertOpen] = useState(false);
  const [fundingAlertOpen, setFundingAlertOpen] = useState(false);
  const [fundingCancelAlertOpen, setFundingCancelAlertOpen] = useState(false);
  const [fundingConfirmOpen, setFundingConfirmOpen] = useState(false);
  const [fundingAlertClosing, setFundingAlertClosing] = useState(false);
  const [fundingCancelClosing, setFundingCancelClosing] = useState(false);
  const [alreadyFundedClosing, setAlreadyFundedClosing] = useState(false);
  const [aiDesignEditMode, setAiDesignEditMode] = useState(false);
  const [aiDesignDraft, setAiDesignDraft] = useState({
    name: "",
    price: 0,
    category: "",
    style: "",
    gender: "",
    description: "",
    story: "",
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginDraft, setLoginDraft] = useState({ handle: "", password: "" });
  const [myBrandDetails, setMyBrandDetails] = useState(() =>
    buildDefaultBrandDetails(brand.name),
  );
  const [introOpen, setIntroOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return window.localStorage.getItem("modifLoggedIn") === "true";
    } catch {
      return false;
    }
  });
  const [pendingTab, setPendingTab] = useState(null);
  const [measurementMode, setMeasurementMode] = useState("manual");
  const [signupDraft, setSignupDraft] = useState(() => ({
    handle: userBase.handle,
    name: userBase.name,
    password: "",
    passwordConfirm: "",
    base_photo_url: null,
    measurements: { ...userBase.measurements },
  }));
  const [signupPhotoFile, setSignupPhotoFile] = useState(null);
  const [selectedStyleIds, setSelectedStyleIds] = useState([]);
  const [profilePasswordDraft, setProfilePasswordDraft] = useState({
    password: "",
    confirm: "",
  });
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New feedback",
      message: "@rose.form sent a comment.",
      removing: false,
      target: { type: "feedback", clothingId: 2 },
    },
    {
      id: 2,
      title: "Funding update",
      message: "OAT EDITION reached 70%.",
      removing: false,
      target: { type: "detail", clothingId: 4 },
    },
  ]);
  const [commentDraft, setCommentDraft] = useState({
    rating: 5,
    text: "",
  });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentMenuId, setCommentMenuId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [designCategory, setDesignCategory] = useState("상의");
  const [designLength, setDesignLength] = useState("민소매");
  const [designGender, setDesignGender] = useState("Unisex");
  const [designTool, setDesignTool] = useState("brush");
  const [designColor, setDesignColor] = useState("#111111");
  const [designSize, setDesignSize] = useState(6);
  const [showClearBubble, setShowClearBubble] = useState(false);
  const [studioSide, setStudioSide] = useState("front");
  const [studioSideImages, setStudioSideImages] = useState({
    front: null,
    back: null,
  });
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [tempDesigns, setTempDesigns] = useState([]);
  const [profilePhotoMode, setProfilePhotoMode] = useState("profile");
  const designCanvasRef = useRef(null);
  const canvasPopupRef = useRef(null);
  const drawMetaRef = useRef({ moved: false });
  const [fittingHistory, setFittingHistory] = useState(initialFittingHistory);

  const fundingsFeed = useMemo(() => {
    return [...fundings]
      .filter((item) => item.status === "FUNDING")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [fundings]);

  const likedClothingIds = useMemo(
    () => fundings.filter((item) => item.liked).map((item) => item.clothing_id),
    [fundings],
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

  const brandProfileMap = useMemo(() => {
    return brandProfiles.reduce((map, profile) => {
      map[profile.brand.toLowerCase()] = profile;
      map[profile.handle.toLowerCase()] = profile;
      return map;
    }, {});
  }, [brandProfiles]);

  const followerSeries = useMemo(() => {
    const values = [176, 182, 188, 195, 201, 208, 214];
    return values.map((value, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (values.length - 1 - index));
      const label = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}`;
      return { date: label, value };
    });
  }, []);
  const effectiveFollowerSeries = useMemo(
    () =>
      brandFollowerOverride !== null
        ? followerSeries.map((item) => ({
          ...item,
          value: brandFollowerOverride,
        }))
        : followerSeries,
    [brandFollowerOverride, followerSeries],
  );
  const followerValues = useMemo(
    () => effectiveFollowerSeries.map((item) => item.value),
    [effectiveFollowerSeries],
  );
  const followerChartWidth = useMemo(() => 360, []);
  const followerChartStep = useMemo(
    () => followerChartWidth / Math.max(1, effectiveFollowerSeries.length - 1),
    [effectiveFollowerSeries.length, followerChartWidth],
  );
  const followerChartPoints = useMemo(() => {
    const height = 120;
    const max = Math.max(...followerValues);
    const min = Math.min(...followerValues);
    return followerValues
      .map((value, index) => {
        const x = index * followerChartStep;
        const y = height - ((value - min) / Math.max(1, max - min)) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }, [followerChartStep, followerValues]);
  const followerTicks = useMemo(() => {
    const max = Math.max(...followerValues);
    const min = Math.min(...followerValues);
    const mid = Math.round((max + min) / 2);
    return [max, mid, min];
  }, [followerValues]);

  const designLengthOptions = useMemo(
    () => ({
      상의: ["민소매", "숏", "미디엄", "롱"],
      하의: ["숏", "하프", "롱"],
      아우터: ["크롭", "숏", "하프", "롱"],
      원피스: ["미니", "미디엄", "롱"],
    }),
    [],
  );

  const formatTimestamp = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${formatDate(date)} ${hours}:${minutes}`;
  };

  const formatAlbumDate = (value) => {
    if (!value) return "";
    return value.includes(":") ? value : `${value} 00:00`;
  };

  const openLimitAlert = (message) => {
    setLimitAlertMessage(message);
    setLimitAlertOpen(true);
    window.setTimeout(() => {
      setLimitAlertOpen(false);
      setLimitAlertMessage("");
    }, 2000);
  };

  const currentFollowerCount =
    effectiveFollowerSeries[effectiveFollowerSeries.length - 1]?.value || 0;
  const followingCount = followedBrands.length;

  const selectedBrandProfile = useMemo(() => {
    if (!selectedBrandKey && !hasBrandPage) return null;
    if (
      selectedBrandKey === "my-brand" ||
      selectedBrandKey === myBrandDetails.handle ||
      selectedBrandKey === myBrandDetails.brand
    ) {
      return {
        id: myBrandId || "my-brand",
        brand: myBrandDetails.brand,
        handle: myBrandDetails.handle,
        followerCount: currentFollowerCount,
        followingCount,
        bio: myBrandDetails.bio,
        location: myBrandDetails.location,
        logoUrl: myBrandDetails.logoUrl,
      };
    }
    return (
      brandProfiles.find(
        (profile) =>
          profile.handle === selectedBrandKey ||
          profile.brand === selectedBrandKey,
      ) || null
    );
  }, [
    brandProfiles,
    currentFollowerCount,
    followingCount,
    hasBrandPage,
    myBrandDetails,
    selectedBrandKey,
  ]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    const handleQuery = query.startsWith("@") ? query.slice(1) : query;
    const results = [];

    clothing.forEach((item) => {
      if (item.name.toLowerCase().includes(query)) {
        const funding = fundings.find((entry) => entry.clothing_id === item.id);
        results.push({
          type: "item",
          label: item.name,
          sublabel: funding?.brand || "",
          clothingId: item.id,
        });
      }
    });

    const seenBrands = new Set();
    fundings.forEach((entry) => {
      const brandKey = entry.brand.toLowerCase();
      const handleKey = entry.designer_handle?.toLowerCase() || "";
      const matchesBrand = brandKey.includes(query);
      const matchesHandle =
        handleKey.includes(handleQuery) || handleKey.includes(query);
      if ((matchesBrand || matchesHandle) && !seenBrands.has(brandKey)) {
        const profile = brandProfileMap[brandKey] ||
          brandProfileMap[handleKey] || {
          id: brandKey,
          brand: entry.brand,
          handle: entry.designer_handle,
          followerCount: 0,
          followingCount: 0,
          bio: "브랜드 프로필이 준비 중입니다.",
          location: "Seoul",
        };
        results.push({
          type: "brand",
          label: profile.brand,
          sublabel: profile.handle,
          profile,
        });
        seenBrands.add(brandKey);
      }
    });

    return results.slice(0, 6);
  }, [brandProfileMap, clothing, fundings, searchQuery]);

  const categoryToMain = useMemo(
    () => ({
      Knit: "Tops",
      Jacket: "Outer",
      Outerwear: "Outer",
      Coat: "Outer",
      Dress: "Dress",
      Concept: "Tops",
    }),
    [],
  );

  const categories = useMemo(() => {
    const set = new Set();
    fundingsFeed.forEach((item) => {
      const category = clothingMap[item.clothing_id]?.category;
      if (category) {
        set.add(category);
      }
    });
    return Array.from(set);
  }, [fundingsFeed, clothingMap]);

  const mainCategories = useMemo(
    () => ["All", "Tops", "Outer", "Bottoms", "Dress"],
    [],
  );
  const mainCategoryLabels = useMemo(
    () => ({
      All: "전체",
      Tops: "상의",
      Outer: "아우터",
      Bottoms: "하의",
      Dress: "원피스",
    }),
    [],
  );
  const signupMeasurementFields = useMemo(
    () => [
      { label: "키", key: "height" },
      { label: "몸무게", key: "weight" },
      { label: "목둘레", key: "neckCircum" },
      { label: "어깨너비", key: "shoulderWidth" },
      { label: "가슴둘레", key: "chestCircum" },
      { label: "허리둘레", key: "waistCircum" },
      { label: "엉덩이둘레", key: "hipCircum" },
      { label: "팔길이", key: "armLength" },
      { label: "다리길이", key: "legLength" },
      { label: "발사이즈", key: "shoeSize" },
    ],
    [],
  );

  const subCategories = useMemo(() => {
    const filtered = categories.filter((category) => {
      if (selectedMainCategory === "All") return true;
      const mapped = categoryToMain[category] || "Tops";
      return mapped === selectedMainCategory;
    });
    return ["All", ...filtered];
  }, [categories, selectedMainCategory, categoryToMain]);

  const filteredFundings = useMemo(() => {
    const filtered = fundingsFeed.filter((item) => {
      const cloth = clothingMap[item.clothing_id];
      if (!cloth) return false;
      const mappedMain = categoryToMain[cloth.category] || "Tops";
      const matchesMain =
        selectedMainCategory === "All" || mappedMain === selectedMainCategory;
      const matchesSub =
        selectedSubCategory === "All" || cloth.category === selectedSubCategory;
      const matchesGender =
        selectedGender === "All" || cloth.gender === selectedGender;
      const matchesStyle =
        selectedStyle === "All" || cloth.style === selectedStyle;
      return matchesMain && matchesSub && matchesGender && matchesStyle;
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
    categoryToMain,
    selectedMainCategory,
    selectedSubCategory,
    selectedGender,
    selectedStyle,
    selectedSort,
  ]);
  const onboardingStyleItems = useMemo(() => {
    const items = [];
    for (const item of clothing) {
      if (!item.design_img_url) continue;
      items.push(item);
      if (items.length >= 12) break;
    }
    return items;
  }, [clothing]);

  const ensureBrandForDesign = () => {
    if (hasBrandPage) return true;
    alert("브랜드 페이지를 먼저 만들어야 합니다.");
    return false;
  };

  const generateDesign = () => {
    if (designCoins <= 0) {
      return;
    }
    const trimmed = prompt.trim();
    const nextId = Math.max(...clothing.map((item) => item.id), 0) + 1;
    const nextImage = `/image${((clothing.length + generatedDesigns.length) % 7) + 1
      }.jpg`;
    const newDesign = {
      id: nextId,
      name: trimmed || `AI 컨셉 ${nextId}`,
      savedAt: formatTimestamp(new Date()),
      category: "Concept",
      design_img_url: nextImage,
      gender: "Unisex",
      style: "Minimal",
      price: 169000,
      size_specs: { shoulder: 44, chest: 98, waist: 82 },
      design_prompt: trimmed || "미니멀 테일러링 실루엣",
      description:
        trimmed ||
        "AI가 생성한 컨셉을 기반으로 실루엣과 소재 밸런스를 설계했습니다.",
      story:
        "AI가 트렌드 데이터를 분석해 감각적인 컬렉션 스토리를 구성했습니다. 디자이너가 세부 디테일을 다듬을 수 있도록 여지를 남겨두었습니다.",
    };

    setClothing((prev) => [...prev, newDesign]);
    setGeneratedDesigns((prev) => [newDesign, ...prev]);
    setBrand((prev) => ({ ...prev, clothes_count: prev.clothes_count + 1 }));
    setPrompt("");
    setDesignCoins((prev) => Math.max(0, prev - 1));
    setDetailTab("overview");
    setAiDesignDraft({
      name: newDesign.name,
      price: newDesign.price,
      category: newDesign.category,
      style: newDesign.style,
      gender: newDesign.gender,
      description: newDesign.description || "",
      story: newDesign.story || "",
    });
    setAiDesignEditMode(false);
    setAiDesignModal({ open: true, design: newDesign });
  };

  const confirmGenerateDesign = () => {
    if (!ensureBrandForDesign()) {
      setDesignGenerateConfirmOpen(false);
      return;
    }
    setDesignGenerateConfirmOpen(false);
    generateDesign();
  };

  const handleAiDesignEditToggle = () => {
    if (!aiDesignModal.design) return;
    if (aiDesignEditMode) {
      const nextDesign = {
        ...aiDesignModal.design,
        name: aiDesignDraft.name.trim() || aiDesignModal.design.name,
        price: Number(aiDesignDraft.price) || 0,
        category:
          aiDesignDraft.category.trim() || aiDesignModal.design.category,
        style: aiDesignDraft.style.trim() || aiDesignModal.design.style,
        gender: aiDesignDraft.gender.trim() || aiDesignModal.design.gender,
        description:
          aiDesignDraft.description.trim() ||
          aiDesignModal.design.description,
        story: aiDesignDraft.story.trim() || aiDesignModal.design.story,
      };
      setAiDesignModal((prev) => ({ ...prev, design: nextDesign }));
      setClothing((prev) =>
        prev.map((item) =>
          item.id === nextDesign.id ? { ...item, ...nextDesign } : item,
        ),
      );
      setGeneratedDesigns((prev) =>
        prev.map((item) =>
          item.id === nextDesign.id ? { ...item, ...nextDesign } : item,
        ),
      );
      setAiDesignEditMode(false);
      return;
    }
    setAiDesignDraft({
      name: aiDesignModal.design.name || "",
      price: aiDesignModal.design.price || 0,
      category: aiDesignModal.design.category || "",
      style: aiDesignModal.design.style || "",
      gender: aiDesignModal.design.gender || "",
      description: aiDesignModal.design.description || "",
      story: aiDesignModal.design.story || "",
    });
    setAiDesignEditMode(true);
  };

  const handleAiDesignUpload = () => {
    if (!aiDesignModal.design) return;
    if (!hasBrandPage) {
      setBrandPageRequiredOpen(true);
      return;
    }
    const brandName = myBrandDetails.brand?.trim() || brand.name;
    const designerHandle = myBrandDetails.handle?.trim() || "@motif.studio";
    const designId = aiDesignModal.design.id;

    setFundings((prev) => {
      const exists = prev.some(
        (entry) =>
          entry.clothing_id === designId && entry.brand === brandName,
      );
      if (exists) return prev;
      const nextId = Math.max(0, ...prev.map((entry) => entry.id)) + 1;
      const nextFunding = {
        id: nextId,
        clothing_id: designId,
        brand: brandName,
        designer_handle: designerHandle,
        participant_count: 0,
        likes: 0,
        liked: false,
        status: "FUNDING",
        goal_amount: 2000000,
        current_amount: 0,
        created_at: formatDate(new Date()),
      };
      return [nextFunding, ...prev];
    });

    setAiDesignModal({ open: false, design: null });
    setAiDesignEditMode(false);
    setActiveTab("portfolio");
    setPortfolioTab("investee");
    setSelectedBrandKey("my-brand");
  };

  const handleTryOn = (clothingId) => {
    setActiveTab("fitting");
    setFocusClothingId(clothingId);
    setFittingLayers((prev) =>
      prev.includes(clothingId) ? prev : [...prev, clothingId],
    );
    setIsComposing(true);
    window.setTimeout(() => setIsComposing(false), 1200);
  };

  const handleLike = (fundingId) => {
    if (!isLoggedIn) {
      openAuthModal("login-required");
      return;
    }
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
      }),
    );
  };

  const removeLayer = (clothingId) => {
    setFittingLayersDraft((prev) => prev.filter((id) => id !== clothingId));
  };

  const moveLayer = (clothingId, direction) => {
    setFittingLayersDraft((prev) => {
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

  const normalizeHandle = useCallback((value) => {
    if (!value) return "";
    return value.startsWith("@") ? value : `@${value}`;
  }, []);

  const applyUserProfile = useCallback((profile) => {
    if (!profile) return;
    setUserProfile((prev) => ({
      ...prev,
      name: profile.name ?? prev.name,
      handle: normalizeHandle(profile.handle ?? profile.name ?? prev.handle),
      followerCount: profile.followerCount ?? prev.followerCount,
      followingCount: profile.followingCount ?? prev.followingCount,
      profile_photo_url: profile.profile_img_url ?? prev.profile_photo_url,
      base_photo_url: profile.base_photo_url ?? prev.base_photo_url,
      measurements: {
        ...prev.measurements,
        ...(profile.measurements || {}),
      },
      bodyTypeLabel: profile.bodyTypeLabel ?? prev.bodyTypeLabel,
      styleTags: Array.isArray(profile.styleTags) ? profile.styleTags : prev.styleTags,
      updatedAt: profile.updatedAt ?? prev.updatedAt,
    }));
  }, [normalizeHandle]);

  const updateProfileField = (key, value) => {
    setUserProfile((prev) => ({
      ...prev,
      [key]: value,
      updatedAt: formatDate(new Date()),
    }));
  };

  const handleProfilePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (profilePhotoMode === "profile") {
      updateProfileField("profile_photo_url", url);
    } else {
      updateProfileField("base_photo_url", url);
    }

    try {
      const type = profilePhotoMode === "body" ? "body" : "profile";
      await uploadProfilePhoto(file, type);
      const profile = await getProfile();
      applyUserProfile(profile);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "프로필 이미지 업로드에 실패했습니다.");
    }
  };

  const updateNote = (brandId, value) => {
    setBrands((prev) =>
      prev.map((item) =>
        item.id === brandId ? { ...item, production_note: value } : item,
      ),
    );
  };

  const designCoinPackages = [
    { id: "starter", label: "Starter 5", amount: 5, price: 1900 },
    { id: "plus", label: "Plus 15", amount: 15, price: 4900 },
    { id: "pro", label: "Pro 30", amount: 30, price: 8900 },
  ];

  const submitComment = () => {
    const trimmed = commentDraft.text.trim();
    if (!detailItem?.clothing?.id || !trimmed) return;
    if (editingCommentId) {
      setComments((prev) =>
        prev.map((item) =>
          item.id === editingCommentId
            ? { ...item, rating: commentDraft.rating, text: trimmed }
            : item,
        ),
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
        100,
      ),
      0,
      100,
    )
    : 0;

  const detailAverageRating = useMemo(() => {
    if (!detailItem?.clothing?.id) return "0.0";
    const target = comments.filter(
      (comment) => comment.clothing_id === detailItem.clothing.id,
    );
    if (!target.length) return "0.0";
    const total = target.reduce((sum, comment) => sum + comment.rating, 0);
    return (total / target.length).toFixed(1);
  }, [comments, detailItem]);

  const detailTags = useMemo(() => {
    if (!detailItem?.clothing) return [];
    const categoryMap = {
      Knit: "니트",
      Jacket: "자켓",
      Coat: "코트",
      Dress: "원피스",
      Top: "상의",
      Bottom: "하의",
      Shirt: "셔츠",
    };
    const styleMap = {
      Minimal: "미니멀",
      Street: "스트릿",
      Classic: "클래식",
      Sport: "스포티",
      Romantic: "로맨틱",
    };
    const genderMap = { Mens: "남자", Womens: "여자", Unisex: "공용" };
    const tags = [
      categoryMap[detailItem.clothing.category] ||
      detailItem.clothing.category,
      styleMap[detailItem.clothing.style] || detailItem.clothing.style,
      genderMap[detailItem.clothing.gender] || detailItem.clothing.gender,
    ].filter(Boolean);
    return Array.from(new Set(tags));
  }, [detailItem]);

  const handleDetailTagClick = (tag) => {
    const categoryMap = {
      Knit: "니트",
      Jacket: "자켓",
      Coat: "코트",
      Dress: "원피스",
      Top: "상의",
      Bottom: "하의",
      Shirt: "셔츠",
    };
    const styleMap = {
      Minimal: "미니멀",
      Street: "스트릿",
      Classic: "클래식",
      Sport: "스포티",
      Romantic: "로맨틱",
    };
    const genderMap = { Mens: "남자", Womens: "여자", Unisex: "공용" };
    const categoryLabelMap = Object.fromEntries(
      Object.entries(categoryMap).map(([key, value]) => [value, key]),
    );
    const styleLabelMap = Object.fromEntries(
      Object.entries(styleMap).map(([key, value]) => [value, key]),
    );
    const genderLabelMap = Object.fromEntries(
      Object.entries(genderMap).map(([key, value]) => [value, key]),
    );

    if (categoryLabelMap[tag]) {
      const category = categoryLabelMap[tag];
      setSelectedMainCategory(categoryToMain[category] || "Tops");
      setSelectedSubCategory(category);
      setSelectedStyle("All");
      setSelectedGender("All");
    } else if (styleLabelMap[tag]) {
      setSelectedStyle(styleLabelMap[tag]);
      setSelectedMainCategory("All");
      setSelectedSubCategory("All");
      setSelectedGender("All");
    } else if (genderLabelMap[tag]) {
      setSelectedGender(genderLabelMap[tag]);
      setSelectedMainCategory("All");
      setSelectedSubCategory("All");
      setSelectedStyle("All");
    }
    setActiveTab("discover");
    setDetailItem(null);
  };

  const finalizeFundNow = () => {
    if (!detailItem?.clothing?.id || !detailItem?.funding?.brand) return;
    const nextId = Math.max(0, ...investments.map((item) => item.id)) + 1;
    const eta = formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));
    const nextItem = {
      id: nextId,
      brand: detailItem.funding.brand,
      itemName: detailItem.clothing.name,
      image: detailItem.clothing.design_img_url,
      amount: detailItem.clothing.price || 0,
      status: "Funding",
      eta,
    };
    setInvestments((prev) => [nextItem, ...prev]);
    setFundingAlertOpen(true);
    setFundingConfirmOpen(false);
    setActiveTab("portfolio");
    setPortfolioTab("investor");
  };

  const handleFundNow = () => {
    if (!detailItem?.clothing?.id || !detailItem?.funding?.brand) return;
    const alreadyFunded = investments.some(
      (item) =>
        item.brand === detailItem.funding.brand &&
        item.itemName === detailItem.clothing.name,
    );
    if (alreadyFunded) {
      setAlreadyFundedAlertOpen(true);
      return;
    }
    setFundingConfirmOpen(true);
  };

  const myBrandProfile = useMemo(
    () => ({
      id: myBrandId || "my-brand",
      brand: myBrandDetails.brand,
      handle: myBrandDetails.handle,
      followerCount: currentFollowerCount,
      followingCount,
      bio: myBrandDetails.bio,
      location: myBrandDetails.location,
      logoUrl: myBrandDetails.logoUrl,
    }),
    [currentFollowerCount, followingCount, myBrandDetails, myBrandId],
  );

  const createBrandPage = () => {
    setHasBrandPage(true);
    setBrandPageReady(false);
    setBrandFollowerOverride(0);
    setMyBrandDetails(buildEmptyBrandDetails());
    setSelectedBrandKey("my-brand");
    setActiveTab("brand");
    setBrandEditing(true);
    setAiDesignModal({ open: false, design: null });
    setAiDesignEditMode(false);
    setBrandCreatePromptOpen(false);
    setBrandPageRequiredOpen(false);
  };

  const validateBrandProfile = () => {
    const brandName = myBrandDetails.brand?.trim() || "";
    if (!brandName || brandName === brandPlaceholders.brand) {
      alert("브랜드 이름을 입력해주세요.");
      return false;
    }
    const bio = myBrandDetails.bio?.trim() || "";
    if (!bio || bio === brandPlaceholders.bio) {
      alert("브랜드 소개를 입력해주세요.");
      return false;
    }
    if (!myBrandDetails.logoUrl) {
      alert("브랜드 로고를 등록해주세요.");
      return false;
    }
    return true;
  };

  const handleCreateBrand = async () => {
    if (!validateBrandProfile()) return;
    if (!window.localStorage.getItem("token")) {
      openAuthModal("login-required");
      return;
    }

    try {
      const payload = {
        brand_name: myBrandDetails.brand.trim(),
        brand_logo: myBrandDetails.logoUrl,
        brand_story: myBrandDetails.bio.trim(),
        is_public: true,
      };
      const created = await createBrand(payload);
      setMyBrandId(created.brand_id ?? created.id ?? null);
      setHasBrandPage(true);
      setBrandEditing(false);
      setBrandPageReady(true);
      setSelectedBrandKey("my-brand");

      const profiles = await getBrandProfiles();
      const normalized = profiles.map((profile) => ({
        ...profile,
        logoUrl: normalizeAssetUrl(profile.brand_logo || profile.logoUrl),
        bio: profile.bio || "",
      }));
      setBrandProfiles(normalized);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "브랜드 생성에 실패했습니다.");
    }
  };

  const handleUpdateBrand = async () => {
    if (!validateBrandProfile()) return;
    const brandId = myBrandId || selectedBrandProfile?.id;
    if (!brandId) {
      alert("브랜드 정보를 찾을 수 없습니다.");
      return;
    }
    try {
      const payload = {
        brand_name: myBrandDetails.brand.trim(),
        brand_logo: myBrandDetails.logoUrl,
        brand_story: myBrandDetails.bio.trim(),
        is_public: true,
      };
      await updateBrand(brandId, payload);
      setBrandEditing(false);
      setBrandPageReady(true);
      setSelectedBrandKey("my-brand");

      const profiles = await getBrandProfiles();
      const normalized = profiles.map((profile) => ({
        ...profile,
        logoUrl: normalizeAssetUrl(profile.brand_logo || profile.logoUrl),
        bio: profile.bio || "",
      }));
      setBrandProfiles(normalized);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "브랜드 저장에 실패했습니다.");
    }
  };

  const handleDeleteBrandPage = async () => {
    const brandId = myBrandId || selectedBrandProfile?.id;
    if (!brandId) {
      resetBrandPage();
      return;
    }

    try {
      await deleteBrand(brandId);
      setMyBrandId(null);
      resetBrandPage();
      const profiles = await getBrandProfiles();
      const normalized = profiles.map((profile) => ({
        ...profile,
        logoUrl: normalizeAssetUrl(profile.brand_logo || profile.logoUrl),
        bio: profile.bio || "",
      }));
      setBrandProfiles(normalized);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "브랜드 삭제에 실패했습니다.");
    }
  };

  const resetBrandPage = () => {
    setHasBrandPage(false);
    setBrandPageReady(false);
    setBrandEditing(false);
    setSelectedBrandKey(null);
    setFollowedBrands([]);
    setBrandFollowerOverride(null);
    setMyBrandDetails(buildEmptyBrandDetails());
    setMyBrandId(null);
    setBrandDeleteConfirmOpen(false);
    setActiveTab("portfolio");
  };

  const followerProfiles = useMemo(
    () => [
      { handle: "@atelier.sen", name: "Atelier Sen" },
      { handle: "@nordic.label", name: "Nordic Label" },
      { handle: "@mono.city", name: "Mono City" },
      { handle: "@pureform.lab", name: "Pureform Lab" },
      { handle: "@linen.work", name: "Linen Work" },
      { handle: "@crest.tailor", name: "Crest Tailor" },
      { handle: "@dusty.hues", name: "Dusty Hues" },
      { handle: "@studio.mono", name: "Studio Mono" },
      { handle: "@flow.archive", name: "Flow Archive" },
      { handle: "@quiet.room", name: "Quiet Room" },
    ],
    [],
  );

  const followingProfiles = useMemo(
    () =>
      brandProfiles.filter((profile) =>
        followedBrands.includes(profile.handle),
      ),
    [brandProfiles, followedBrands],
  );

  const brandFeed = useMemo(() => {
    if (!selectedBrandProfile) return [];
    return fundings
      .filter((entry) => entry.brand === selectedBrandProfile.brand)
      .map((entry) => ({
        funding: entry,
        clothing: clothingMap[entry.clothing_id],
      }))
      .filter((entry) => entry.clothing);
  }, [clothingMap, fundings, selectedBrandProfile]);

  const handleCanvasDraw = (event) => {
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawMetaRef.current.moved = false;
    ctx.lineWidth = designSize;
    ctx.lineCap = "round";
    if (designTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = designColor;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const startX = (event.clientX - rect.left) * scaleX;
    const startY = (event.clientY - rect.top) * scaleY;
    drawMetaRef.current.startX = startX;
    drawMetaRef.current.startY = startY;
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const draw = (moveEvent) => {
      drawMetaRef.current.moved = true;
      const x = (moveEvent.clientX - rect.left) * scaleX;
      const y = (moveEvent.clientY - rect.top) * scaleY;
      const dx = x - drawMetaRef.current.startX;
      const dy = y - drawMetaRef.current.startY;
      if (Math.hypot(dx, dy) < 3) {
        return;
      }
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stop = () => {
      ctx.globalCompositeOperation = "source-over";
      window.removeEventListener("mousemove", draw);
      window.removeEventListener("mouseup", stop);
      if (!drawMetaRef.current.moved) {
        openCanvasZoom();
      }
    };

    window.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", stop);
  };

  const openCanvasZoom = () => {
    if (designPhoto?.url) {
      setImagePreview(designPhoto.url);
      return;
    }
    if (canvasPopupRef.current && !canvasPopupRef.current.closed) {
      canvasPopupRef.current.focus();
      return;
    }
    const width = window.screen.availWidth || 1280;
    const height = window.screen.availHeight || 900;
    const popup = window.open(
      "",
      "modif-canvas",
      `width=${width},height=${height},left=0,top=0`,
    );
    if (!popup) return;
    canvasPopupRef.current = popup;
    popup.moveTo(0, 0);
    popup.resizeTo(width, height);
    const source = designCanvasRef.current;
    const dataUrl = source ? source.toDataURL("image/png") : "";
    const payload = {
      dataUrl,
      color: designColor,
      size: designSize,
      tool: designTool,
    };
    const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>Design Canvas</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0; font-family: "Pretendard", Arial, sans-serif; background: #f4f4f4; }
    .page { display: grid; gap: 18px; padding: 28px; }
    .header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
    .header h1 { margin: 0; font-size: 22px; }
    .header p { margin: 6px 0 0; font-size: 12px; color: #666; }
    .actions { display: flex; gap: 8px; }
    .btn { border: 1px solid #111; background: #111; color: #fff; border-radius: 999px; padding: 6px 12px; font-size: 12px; cursor: pointer; }
    .btn.secondary { background: #fff; color: #111; }
    .panel { background: #fff; border: 1px solid #e5e5e5; border-radius: 16px; padding: 16px; display: grid; gap: 16px; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; position: relative; }
    .tool-sub { position: absolute; top: 36px; left: 50%; transform: translateX(-50%); display: none; z-index: 5; }
    .tool-sub.is-visible { display: block; }
    .tool-sub .bubble { position: relative; display: inline-flex; align-items: center; white-space: nowrap; }
    .tool-sub .bubble::before { content: ""; position: absolute; top: -6px; left: 50%; width: 10px; height: 10px; background: #fff; border-left: 1px solid #e5e5e5; border-top: 1px solid #e5e5e5; transform: translateX(-50%) rotate(45deg); }
    .clear-btn { border: 1px solid #e5e5e5; background: #fff; color: #111; border-radius: 999px; padding: 4px 10px; font-size: 11px; cursor: pointer; box-shadow: 0 8px 16px rgba(0,0,0,0.08); }
    .tool-group { display: inline-flex; gap: 8px; align-items: center; }
    .tool-anchor { position: relative; display: inline-flex; }
    .tool-group.end { margin-left: auto; }
    .tool-btn { border: 1px solid #e5e5e5; background: #fff; color: #111; border-radius: 999px; width: 32px; height: 32px; display: grid; place-items: center; cursor: pointer; }
    .tool-btn.active { border-color: #111; background: #111; color: #fff; }
    .tool-btn:disabled { color: #b5b5b5; border-color: #e2e2e2; cursor: default; }
    .tool-btn svg { width: 16px; height: 16px; }
    .color-picker { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: #666; }
    .color-picker input { width: 28px; height: 28px; border-radius: 8px; border: 1px solid #e5e5e5; padding: 0; background: transparent; cursor: pointer; }
    .size-control { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: #666; }
    .size-control input { width: 160px; accent-color: #111; }
    canvas { width: 100%; height: 72vh; max-height: 720px; border-radius: 16px; border: 1px solid #e5e5e5; background: #fff; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <h1>디자인 캔버스</h1>
        <p>드로잉 후 저장하면 워크벤치로 돌아갑니다.</p>
      </div>
      <div class="actions">
        <button class="btn secondary" id="cancelBtn">돌아가기</button>
        <button class="btn" id="saveBtn">저장</button>
      </div>
    </div>
    <div class="panel">
      <div class="toolbar">
        <div class="tool-group">
          <button class="tool-btn" id="brushBtn" title="Brush" aria-label="Brush">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
              <path d="m15 5 4 4"/>
            </svg>
          </button>
          <div class="tool-anchor">
            <button class="tool-btn" id="eraserBtn" title="Eraser" aria-label="Eraser">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/>
                <path d="m5.082 11.09 8.828 8.828"/>
              </svg>
            </button>
            <div class="tool-sub" id="clearWrap">
              <div class="bubble">
                <button class="clear-btn" id="clearBtn">모두 지우기</button>
              </div>
            </div>
          </div>
          <button class="tool-btn" id="selectBtn" title="Select" aria-label="Select">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke-dasharray="3 3"/>
            </svg>
          </button>
          <button class="tool-btn" id="fillBtn" title="Fill" aria-label="Fill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 11l6-6 5 5-6 6-5-5z"/>
              <path d="M4 20h12"/>
              <path d="M18 14l2 2"/>
            </svg>
          </button>
        </div>
        <label class="color-picker">색상 <input type="color" id="colorInput" /></label>
        <label class="size-control">굵기 <input type="range" min="2" max="14" id="sizeInput" /></label>
        <div class="tool-group end">
          <button class="tool-btn" id="undoBtn" aria-label="되돌리기" title="되돌리기">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 8l-4 4 4 4"/>
              <path d="M3 12h10a6 6 0 1 1 0 12"/>
            </svg>
          </button>
          <button class="tool-btn" id="redoBtn" aria-label="되돌리기 취소" title="되돌리기 취소">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 8l4 4-4 4"/>
              <path d="M21 12H11a6 6 0 1 0 0 12"/>
            </svg>
          </button>
        </div>
      </div>
      <canvas id="canvas" width="1100" height="720"></canvas>
    </div>
  </div>
  <script>
    const state = ${JSON.stringify(payload)};
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const brushBtn = document.getElementById("brushBtn");
    const eraserBtn = document.getElementById("eraserBtn");
    const selectBtn = document.getElementById("selectBtn");
    const fillBtn = document.getElementById("fillBtn");
    const colorInput = document.getElementById("colorInput");
    const sizeInput = document.getElementById("sizeInput");
    const saveBtn = document.getElementById("saveBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");
    const clearBtn = document.getElementById("clearBtn");
    const clearWrap = document.getElementById("clearWrap");

    let tool = state.tool || "brush";
    let color = state.color || "#111111";
    let size = state.size || 6;
    let clearVisible = false;
    let selection = {
      active: false,
      selecting: false,
      dragging: false,
      startX: 0,
      startY: 0,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      offsetX: 0,
      offsetY: 0,
      canvas: null,
    };
    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = canvas.width;
    baseCanvas.height = canvas.height;
    const baseCtx = baseCanvas.getContext("2d");
    const history = [];
    const redoHistory = [];
    const maxHistory = 30;
    const updateUndoRedoUI = () => {
      undoBtn.disabled = history.length <= 1;
      redoBtn.disabled = redoHistory.length === 0;
    };
    const seedHistory = () => {
      history.length = 0;
      redoHistory.length = 0;
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      history.push(snapshot);
      updateUndoRedoUI();
    };

    const applyToolUI = () => {
      brushBtn.classList.toggle("active", tool === "brush");
      eraserBtn.classList.toggle("active", tool === "eraser");
      selectBtn.classList.toggle("active", tool === "select");
      fillBtn.classList.toggle("active", tool === "fill");
      colorInput.value = color;
      sizeInput.value = size;
      canvas.style.cursor =
        tool === "select" || tool === "fill" ? "crosshair" : "crosshair";
      clearWrap.classList.toggle("is-visible", tool === "eraser" && clearVisible);
      if (tool !== "select" && selection.active) {
        commitSelection();
      }
    };

    const drawImage = (dataUrl) => {
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        baseCtx.clearRect(0, 0, canvas.width, canvas.height);
        baseCtx.drawImage(canvas, 0, 0);
        seedHistory();
      };
      img.src = dataUrl;
    };

    let drawing = false;

    const getCanvasPoint = (event) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    };

    const clampValue = (value, min, max) => Math.max(min, Math.min(value, max));

    const renderSelection = (showBorder = true) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseCanvas, 0, 0);
      if (selection.canvas) {
        ctx.drawImage(selection.canvas, selection.x, selection.y);
      }
      if (showBorder) {
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 1;
        ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
        ctx.restore();
      }
    };

    const commitSelection = () => {
      if (!selection.active || !selection.canvas) return;
      baseCtx.drawImage(selection.canvas, selection.x, selection.y);
      selection.active = false;
      selection.canvas = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseCanvas, 0, 0);
    };

    const startSelection = (point) => {
      pushHistory();
      selection.selecting = true;
      selection.startX = point.x;
      selection.startY = point.y;
      selection.w = 0;
      selection.h = 0;
      baseCtx.clearRect(0, 0, canvas.width, canvas.height);
      baseCtx.drawImage(canvas, 0, 0);
    };

    const finalizeSelection = (point) => {
      selection.selecting = false;
      const rawW = point.x - selection.startX;
      const rawH = point.y - selection.startY;
      const x = rawW < 0 ? point.x : selection.startX;
      const y = rawH < 0 ? point.y : selection.startY;
      const w = Math.abs(rawW);
      const h = Math.abs(rawH);
      if (w < 6 || h < 6) {
        selection.active = false;
        selection.canvas = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseCanvas, 0, 0);
        return;
      }
      selection.active = true;
      selection.x = clampValue(x, 0, canvas.width);
      selection.y = clampValue(y, 0, canvas.height);
      selection.w = clampValue(w, 0, canvas.width - selection.x);
      selection.h = clampValue(h, 0, canvas.height - selection.y);
      const selCanvas = document.createElement("canvas");
      selCanvas.width = selection.w;
      selCanvas.height = selection.h;
      const selCtx = selCanvas.getContext("2d");
      const imgData = baseCtx.getImageData(
        selection.x,
        selection.y,
        selection.w,
        selection.h,
      );
      selCtx.putImageData(imgData, 0, 0);
      selection.canvas = selCanvas;
      baseCtx.clearRect(selection.x, selection.y, selection.w, selection.h);
      renderSelection();
    };

    const isInsideSelection = (point) =>
      selection.active &&
      point.x >= selection.x &&
      point.x <= selection.x + selection.w &&
      point.y >= selection.y &&
      point.y <= selection.y + selection.h;

    const handleSelectionStart = (event) => {
      const point = getCanvasPoint(event);
      if (selection.active && isInsideSelection(point)) {
        pushHistory();
        selection.dragging = true;
        selection.offsetX = point.x - selection.x;
        selection.offsetY = point.y - selection.y;
        return;
      }
      if (selection.active) {
        commitSelection();
      }
      startSelection(point);
    };

    const handleSelectionMove = (event) => {
      const point = getCanvasPoint(event);
      if (selection.dragging) {
        selection.x = clampValue(point.x - selection.offsetX, 0, canvas.width - selection.w);
        selection.y = clampValue(point.y - selection.offsetY, 0, canvas.height - selection.h);
        renderSelection();
        return;
      }
      if (!selection.selecting) return;
      selection.w = point.x - selection.startX;
      selection.h = point.y - selection.startY;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseCanvas, 0, 0);
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 1;
      ctx.strokeRect(selection.startX, selection.startY, selection.w, selection.h);
      ctx.restore();
    };

    const handleSelectionEnd = (event) => {
      if (selection.dragging) {
        selection.dragging = false;
        renderSelection();
        return;
      }
      if (!selection.selecting) return;
      const point = getCanvasPoint(event);
      finalizeSelection(point);
    };

    const hexToRgba = (hex) => {
      const value = hex.replace("#", "");
      const num = parseInt(value.length === 3 ? value.split("").map((c) => c + c).join("") : value, 16);
      return [num >> 16, (num >> 8) & 255, num & 255, 255];
    };

    const colorsMatch = (data, index, target) =>
      data[index] === target[0] &&
      data[index + 1] === target[1] &&
      data[index + 2] === target[2] &&
      data[index + 3] === target[3];

    const fillAtPoint = (event) => {
      pushHistory();
      const point = getCanvasPoint(event);
      const x = Math.floor(point.x);
      const y = Math.floor(point.y);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const targetIndex = (y * canvas.width + x) * 4;
      const targetColor = [
        data[targetIndex],
        data[targetIndex + 1],
        data[targetIndex + 2],
        data[targetIndex + 3],
      ];
      const fillColor = hexToRgba(color);
      if (colorsMatch(data, targetIndex, fillColor)) return;
      const stack = [[x, y]];
      while (stack.length) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) continue;
        const idx = (cy * canvas.width + cx) * 4;
        if (!colorsMatch(data, idx, targetColor)) continue;
        data[idx] = fillColor[0];
        data[idx + 1] = fillColor[1];
        data[idx + 2] = fillColor[2];
        data[idx + 3] = fillColor[3];
        stack.push([cx + 1, cy]);
        stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]);
        stack.push([cx, cy - 1]);
      }
      ctx.putImageData(imageData, 0, 0);
      if (selection.active) {
        selection.active = false;
        selection.canvas = null;
      }
      baseCtx.clearRect(0, 0, canvas.width, canvas.height);
      baseCtx.drawImage(canvas, 0, 0);
    };

    const startDraw = (event) => {
      if (tool === "select") {
        handleSelectionStart(event);
        return;
      }
      if (tool === "fill") {
        if (selection.active) {
          commitSelection();
        }
        fillAtPoint(event);
        return;
      }
      drawing = true;
      pushHistory();
      const point = getCanvasPoint(event);
      const x = point.x;
      const y = point.y;
      ctx.lineCap = "round";
      ctx.lineWidth = size;
      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
      }
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const moveDraw = (event) => {
      if (tool === "select") {
        handleSelectionMove(event);
        return;
      }
      if (!drawing) return;
      const point = getCanvasPoint(event);
      const x = point.x;
      const y = point.y;
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDraw = (event) => {
      if (tool === "select") {
        handleSelectionEnd(event);
        return;
      }
      drawing = false;
      ctx.globalCompositeOperation = "source-over";
    };

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", moveDraw);
    window.addEventListener("mouseup", stopDraw);

    brushBtn.addEventListener("click", () => {
      tool = "brush";
      clearVisible = false;
      applyToolUI();
    });
    eraserBtn.addEventListener("click", () => {
      if (tool === "eraser") {
        clearVisible = !clearVisible;
      } else {
        tool = "eraser";
        clearVisible = false;
      }
      applyToolUI();
    });
    selectBtn.addEventListener("click", () => { tool = "select"; applyToolUI(); });
    fillBtn.addEventListener("click", () => {
      tool = "fill";
      clearVisible = false;
      applyToolUI();
    });
    colorInput.addEventListener("input", (e) => { color = e.target.value; });
    sizeInput.addEventListener("input", (e) => { size = Number(e.target.value); applyToolUI(); });
    undoBtn.addEventListener("click", () => {
      if (history.length <= 1) return;
      selection.active = false;
      selection.canvas = null;
      const snapshot = history.pop();
      const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      redoHistory.push(current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(snapshot, 0, 0);
      baseCtx.clearRect(0, 0, canvas.width, canvas.height);
      baseCtx.putImageData(snapshot, 0, 0);
      updateUndoRedoUI();
    });
    redoBtn.addEventListener("click", () => {
      if (!redoHistory.length) return;
      selection.active = false;
      selection.canvas = null;
      const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      history.push(current);
      const snapshot = redoHistory.pop();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(snapshot, 0, 0);
      baseCtx.clearRect(0, 0, canvas.width, canvas.height);
      baseCtx.putImageData(snapshot, 0, 0);
      updateUndoRedoUI();
    });
    clearBtn.addEventListener("click", () => {
      selection.active = false;
      selection.canvas = null;
      pushHistory();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      baseCtx.clearRect(0, 0, canvas.width, canvas.height);
      updateUndoRedoUI();
    });

    saveBtn.addEventListener("click", () => {
      const dataUrl = canvas.toDataURL("image/png");
      window.opener && window.opener.postMessage({ type: "modif-canvas-save", dataUrl }, "*");
      window.close();
    });

    cancelBtn.addEventListener("click", () => {
      window.opener && window.opener.postMessage({ type: "modif-canvas-cancel" }, "*");
      window.close();
    });

    window.addEventListener("beforeunload", () => {
      window.opener && window.opener.postMessage({ type: "modif-canvas-close" }, "*");
    });

    drawImage(state.dataUrl);
    applyToolUI();
    updateUndoRedoUI();

    function pushHistory() {
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      history.push(snapshot);
      redoHistory.length = 0;
      if (history.length > maxHistory) {
        history.shift();
      }
      updateUndoRedoUI();
    }
  </script>
</body>
</html>`;
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  };

  const saveTempDesign = (name) => {
    const totalDesignCount = generatedDesigns.length + tempDesigns.length;
    if (totalDesignCount >= 10) {
      openLimitAlert(
        "저장된 디자인은 10장까지만 보관됩니다. 기존 디자인을 삭제한 뒤 다시 시도해주세요.",
      );
      return;
    }
    const canvas = designCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const nextId = `temp-${Date.now()}`;
    setTempDesigns((prev) => [
      {
        id: nextId,
        name: name || "임시 스케치",
        savedAt: formatTimestamp(new Date()),
        design_prompt: name || prompt.trim() || "임시 스케치",
        design_img_url: dataUrl,
        isTemp: true,
      },
      ...prev,
    ]);
  };

  const removeDesign = (designId, isTemp) => {
    if (isTemp) {
      setTempDesigns((prev) => prev.filter((item) => item.id !== designId));
      return;
    }
    setGeneratedDesigns((prev) => prev.filter((item) => item.id !== designId));
  };

  const clearDesignCanvas = () => {
    const canvas = designCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const resetFilters = () => {
    setSelectedMainCategory("All");
    setSelectedSubCategory("All");
    setSelectedGender("All");
    setSelectedStyle("All");
    setFilterOpen(false);
  };

  const resetOnboarding = () => {
    setSignupDraft({
      handle: userProfile.handle,
      name: userProfile.name,
      password: "",
      passwordConfirm: "",
      base_photo_url: null,
      measurements: { ...userProfile.measurements },
    });
    setSelectedStyleIds([]);
    setOnboardingStep(0);
    setMeasurementMode("manual");
  };

  const startOnboarding = () => {
    setIntroOpen(false);
    resetOnboarding();
    setOnboardingOpen(true);
  };

  const openLoginFlow = () => {
    setIntroOpen(false);
    setLoginModalOpen(true);
  };

  const openAuthModal = (mode) => {
    setAuthModal({ open: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ open: false, mode: null });
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const closeCancelFundingModal = () => {
    setCancelFundingModal({ open: false, investmentId: null });
  };

  const closeFundingAlert = () => {
    setFundingAlertClosing(true);
    window.setTimeout(() => {
      setFundingAlertOpen(false);
      setFundingAlertClosing(false);
    }, 250);
  };

  const closeFundingCancelAlert = () => {
    setFundingCancelClosing(true);
    window.setTimeout(() => {
      setFundingCancelAlertOpen(false);
      setFundingCancelClosing(false);
    }, 250);
  };

  const closeAlreadyFundedAlert = () => {
    setAlreadyFundedClosing(true);
    window.setTimeout(() => {
      setAlreadyFundedAlertOpen(false);
      setAlreadyFundedClosing(false);
    }, 250);
  };

  const closeDesignCoinAlert = () => {
    setDesignCoinAlertClosing(true);
    window.setTimeout(() => {
      setDesignCoinAlertOpen(false);
      setDesignCoinAlertClosing(false);
    }, 250);
  };

  const submitLogin = async () => {
    if (!loginDraft.handle.trim() || !loginDraft.password.trim()) return;
    try {
      const result = await login(loginDraft.handle, loginDraft.password);
      const token = result?.data?.token;
      if (!token) {
        throw new Error("로그인 토큰을 받지 못했습니다.");
      }
      window.localStorage.setItem("token", token);

      const loginUser = result?.data?.user;
      if (loginUser?.userName) {
        applyUserProfile({ name: loginUser.userName, handle: loginUser.userName });
      }

      setIsLoggedIn(true);
      setLoginModalOpen(false);
      setActiveTab(pendingTab || "discover");
      setPendingTab(null);
      setLoginDraft({ handle: "", password: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "로그인에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    setIsLoggedIn(false);
    setActiveTab("discover");
    setDetailItem(null);
    setNotificationOpen(false);
    setSearchOpen(false);
    setPortfolioListOpen(null);
    setSelectedBrandKey(null);
    setPendingTab(null);
    setLoginDraft({ handle: "", password: "" });
    setHasBrandPage(false);
    setBrandPageReady(false);
    setBrandEditing(false);
    setBrandFollowerOverride(null);
    setMyBrandDetails(buildEmptyBrandDetails());
    setMyBrandId(null);
    setBrandDeleteConfirmOpen(false);
    setBrandCreatePromptOpen(false);
    setUserProfile(userBase);
    setFundings((prev) =>
      prev.map((item) =>
        item.liked
          ? { ...item, liked: false, likes: Math.max(0, item.likes - 1) }
          : item,
      ),
    );
  };

  const handleAccountDelete = async () => {
    try {
      await deleteAccount();
      handleLogout();
      resetBrandPage();
      setUserProfile(userBase);
      setSignupDraft({
        handle: userBase.handle,
        name: userBase.name,
        password: "",
        passwordConfirm: "",
        base_photo_url: null,
        measurements: { ...userBase.measurements },
      });
      setSelectedStyleIds([]);
      setMeasurementMode("manual");
      setIntroOpen(true);
      setOnboardingOpen(false);
      setAccountDeleteConfirmOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "탈퇴에 실패했습니다.");
    }
  };

  const handleRestrictedNav = (nextTab) => {
    if (isLoggedIn) {
      setActiveTab(nextTab);
      return;
    }
    setPendingTab(nextTab);
    openAuthModal("login-required");
  };

  const updateSignupField = (key, value) => {
    setSignupDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updateSignupMeasurement = (key, value) => {
    const numeric = Number(value);
    setSignupDraft((prev) => ({
      ...prev,
      measurements: { ...prev.measurements, [key]: numeric },
    }));
  };

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // 1. 파일을 미리보기용 주소(URL)로 변환! (이게 빠져서 안 떴던 거야)
      const imageUrl = URL.createObjectURL(file);

      // 2. 상태 업데이트 (사진 주소 저장)
      setSignupDraft((prev) => ({
        ...prev,
        base_photo_url: imageUrl,
      }));
      setSignupPhotoFile(file);
    }
  };

  const handleDesignPhotoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDesignPhoto({ url, name: file.name });
  };

  const clearDesignPhoto = () => {
    setDesignPhoto(null);
    if (designPhotoInputRef.current) {
      designPhotoInputRef.current.value = "";
    }
  };

  const loadDesignToCanvas = (src) => {
    const canvas = designCanvasRef.current;
    if (!canvas || !src) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const image = new Image();
    image.onload = () => {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const scale = Math.min(
        canvasWidth / image.width,
        canvasHeight / image.height,
      );
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    };
    image.src = src;
  };

  const switchStudioSide = (nextSide) => {
    if (nextSide === studioSide) return;
    const canvas = designCanvasRef.current;
    if (canvas) {
      const currentUrl = canvas.toDataURL("image/png");
      setStudioSideImages((prev) => ({ ...prev, [studioSide]: currentUrl }));
    }
    const nextUrl = studioSideImages[nextSide];
    setStudioSide(nextSide);
    if (nextUrl) {
      loadDesignToCanvas(nextUrl);
    } else {
      clearDesignCanvas();
    }
  };

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const saveFittingSnapshot = async (name, view) => {
    if (fittingHistory.length >= 10) {
      openLimitAlert(
        "피팅 앨범은 10장까지만 저장할 수 있습니다. 기존 항목을 삭제한 뒤 다시 시도해주세요.",
      );
      return;
    }
    const timestamp = formatTimestamp(new Date());
    const targetView = view || fittingView;
    if (targetView === "3d") {
      if (!fittingCanvasRef.current) return;
      const dataUrl = fittingCanvasRef.current.toDataURL("image/png");
      setFittingHistory((prev) => [
        {
          id: `fit-${Date.now()}`,
          title: name || "3D Snapshot",
          image: dataUrl,
          date: timestamp,
        },
        ...prev,
      ]);
      return;
    }

    try {
      const baseImage = await loadImage("/image7.png");
      const canvas = document.createElement("canvas");
      canvas.width = baseImage.width;
      canvas.height = baseImage.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(fittingZoom, fittingZoom);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      const layerWidth = canvas.width * 0.6;
      const layerHeight = canvas.height * 0.6;
      const layerX = (canvas.width - layerWidth) / 2;
      const layerY = (canvas.height - layerHeight) / 2;
      for (const id of fittingLayers) {
        const src = clothingMap[id]?.design_img_url;
        if (!src) continue;
        const layerImage = await loadImage(src);
        ctx.drawImage(layerImage, layerX, layerY, layerWidth, layerHeight);
      }
      ctx.restore();
      const dataUrl = canvas.toDataURL("image/png");
      setFittingHistory((prev) => [
        {
          id: `fit-${Date.now()}`,
          title: name || "Real Snapshot",
          image: dataUrl,
          date: timestamp,
        },
        ...prev,
      ]);
    } catch {
      // Ignore snapshot failures (missing assets, tainted canvas).
    }
  };

  const toggleStyleSelection = (clothingId) => {
    setSelectedStyleIds((prev) =>
      prev.includes(clothingId)
        ? prev.filter((id) => id !== clothingId)
        : [...prev, clothingId],
    );
  };

  const finalizeOnboarding = async () => {
    try {
      const email = signupDraft.handle;
      const password = signupDraft.password;

      // Backend expects: email, password, userName, height, weight
      const userData = {
        email,
        password,
        userName: signupDraft.name,
        height: Number(signupDraft.measurements.height) || 0,
        weight: Number(signupDraft.measurements.weight) || 0,
      };

      await signup(userData);

      const loginResult = await login(email, password);
      const token = loginResult?.data?.token;
      if (!token) {
        throw new Error("로그인 토큰을 받지 못했습니다.");
      }
      window.localStorage.setItem("token", token);
      setIsLoggedIn(true);

      if (signupPhotoFile) {
        try {
          await uploadProfilePhoto(signupPhotoFile);
        } catch (err) {
          console.error(err);
          alert(err.response?.data?.message || "프로필 이미지 업로드에 실패했습니다.");
        }
      }

      const rawMetrics = {
        height: signupDraft.measurements.height,
        weight: signupDraft.measurements.weight,
        neckCircum: signupDraft.measurements.neckCircum,
        shoulderWidth: signupDraft.measurements.shoulderWidth,
        chestCircum: signupDraft.measurements.chestCircum,
        waistCircum: signupDraft.measurements.waistCircum,
        hipCircum: signupDraft.measurements.hipCircum,
        armLength: signupDraft.measurements.armLength,
        legLength: signupDraft.measurements.legLength,
        footSize: signupDraft.measurements.shoeSize,
      };

      const bodyMetrics = Object.fromEntries(
        Object.entries(rawMetrics)
          .map(([key, value]) => [key, Number(value)])
          .filter(([, value]) => !Number.isNaN(value) && value > 0),
      );

      if (Object.keys(bodyMetrics).length > 0) {
        await updateBodyMetrics(bodyMetrics);
      }

      const profile = await getProfile();
      applyUserProfile(profile);

      alert("회원가입이 완료되었습니다.");
      setSignupPhotoFile(null);
      setOnboardingOpen(false);
      setIntroOpen(false);
      setLoginModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "회원가입에 실패했습니다.");
    }
  };

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    window.localStorage.setItem("modifLoggedIn", isLoggedIn ? "true" : "false");
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const token = window.localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    let active = true;
    (async () => {
      try {
        const profile = await getProfile();
        if (active) {
          applyUserProfile(profile);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          window.localStorage.removeItem("token");
          setIsLoggedIn(false);
        } else {
          console.error(err);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [applyUserProfile, isLoggedIn]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const profiles = await getBrandProfiles();
        if (!active) return;
        const normalized = profiles.map((profile) => ({
          ...profile,
          logoUrl: normalizeAssetUrl(profile.brand_logo || profile.logoUrl),
          bio: profile.bio || "",
        }));
        setBrandProfiles(normalized);

        const myProfile = normalized.find(
          (profile) => profile.handle === userProfile.handle,
        );
        if (myProfile && !brandEditing) {
          setHasBrandPage(true);
          setBrandPageReady(true);
          setMyBrandId(myProfile.id);
          setMyBrandDetails((prev) => ({
            ...prev,
            brand: myProfile.brand,
            bio: myProfile.bio || brandPlaceholders.bio,
            logoUrl: myProfile.logoUrl,
          }));
        } else if (isLoggedIn && !brandEditing) {
          setHasBrandPage(false);
          setBrandPageReady(false);
          setMyBrandId(null);
          setMyBrandDetails(buildEmptyBrandDetails());
        }
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      active = false;
    };
  }, [brandEditing, isLoggedIn, userProfile.handle]);

  useEffect(() => {
    if (!userProfile.handle) return;
    setMyBrandDetails((prev) =>
      prev.handle ? prev : { ...prev, handle: userProfile.handle },
    );
  }, [userProfile.handle]);

  useEffect(() => {
    const handleMessage = (event) => {
      const payload = event?.data;
      if (!payload || typeof payload !== "object") return;
      if (payload.type !== "modif-canvas-save") return;
      if (!payload.dataUrl) return;
      const target = designCanvasRef.current;
      if (!target) return;
      const ctx = target.getContext("2d");
      if (!ctx) return;
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, target.width, target.height);
        ctx.drawImage(image, 0, 0, target.width, target.height);
      };
      image.src = payload.dataUrl;
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("intro-open", introOpen);
    return () => {
      document.body.classList.remove("intro-open");
    };
  }, [introOpen]);

  useEffect(() => {
    if (!fundingAlertOpen) return undefined;
    const timer = window.setTimeout(() => {
      closeFundingAlert();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [fundingAlertOpen]);

  useEffect(() => {
    if (!fundingCancelAlertOpen) return undefined;
    const timer = window.setTimeout(() => {
      closeFundingCancelAlert();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [fundingCancelAlertOpen]);

  useEffect(() => {
    if (!alreadyFundedAlertOpen) return undefined;
    const timer = window.setTimeout(() => {
      closeAlreadyFundedAlert();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [alreadyFundedAlertOpen]);

  useEffect(() => {
    if (!designCoinAlertOpen) return undefined;
    const timer = window.setTimeout(() => {
      closeDesignCoinAlert();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [designCoinAlertOpen]);

  useEffect(() => {
    if (!introOpen) return;
    const sections = document.querySelectorAll(
      ".intro-section, .intro-actions",
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.55 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [introOpen]);

  const openClothingDetail = (clothingId) => {
    const funding = fundings.find((entry) => entry.clothing_id === clothingId);
    const cloth = clothingMap[clothingId];
    if (!funding || !cloth) return;
    setDetailItem({ funding, clothing: cloth });
    setDetailTab("overview");
    setActiveTab("discover");
    setSearchOpen(false);
  };

  const openBrandProfile = (profile) => {
    if (!profile) return;
    const key = profile.handle || profile.brand || profile.id;
    setSelectedBrandKey(key);
    setActiveTab("brand");
    setDetailItem(null);
    setSearchOpen(false);
    if (
      profile.handle === myBrandDetails.handle &&
      hasBrandPage &&
      brandPageReady
    ) {
      setBrandEditing(false);
    }
  };

  const openNotificationTarget = (notice) => {
    if (!notice?.target) return;
    if (notice.target.type === "detail" || notice.target.type === "feedback") {
      openClothingDetail(notice.target.clothingId);
      if (notice.target.type === "feedback") {
        setDetailTab("feedback");
      }
      return;
    }
    if (notice.target.type === "brand") {
      const profile = brandProfiles.find(
        (item) => item.handle === notice.target.handle,
      );
      if (profile) {
        openBrandProfile(profile);
      }
    }
  };

  const toggleFollowBrand = (handle) => {
    if (!handle) return;
    if (handle === myBrandDetails.handle) return;
    setFollowedBrands((prev) => {
      const isFollowed = prev.includes(handle);
      setBrandProfiles((current) =>
        current.map((profile) =>
          profile.handle === handle
            ? {
              ...profile,
              followerCount: Math.max(
                0,
                profile.followerCount + (isFollowed ? -1 : 1),
              ),
            }
            : profile,
        ),
      );
      return isFollowed
        ? prev.filter((item) => item !== handle)
        : [...prev, handle];
    });
  };

  const requiredStyleCount = 3;
  const passwordReady =
    signupDraft.password.trim().length > 0 &&
    signupDraft.passwordConfirm.trim().length > 0 &&
    signupDraft.password === signupDraft.passwordConfirm;
  const showPasswordHint =
    signupDraft.passwordConfirm.trim().length > 0 && !passwordReady;
  const canProceedProfile =
    signupDraft.handle.trim().length > 0 &&
    signupDraft.name.trim().length > 0 &&
    passwordReady;
  const canFinishOnboarding =
    canProceedProfile && selectedStyleIds.length >= requiredStyleCount;

  if (onboardingOpen) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-actions">
          <button
            type="button"
            className="onboarding-back"
            onClick={() => {
              setOnboardingOpen(false);
              setIntroOpen(true);
              resetOnboarding();
            }}
          >
            돌아가기
          </button>
          <button
            type="button"
            className="onboarding-login"
            onClick={() => {
              setOnboardingOpen(false);
              setIntroOpen(false);
              openAuthModal("login-required");
            }}
          >
            로그인
          </button>
        </div>
        <video
          className="onboarding-video"
          src="/background.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="onboarding-overlay" />
        <div className="onboarding-shell">
          <header className="onboarding-header">
            <div>
              <span className="onboarding-step">
                Step {onboardingStep + 1} / 2
              </span>
              <h2>당신의 스타일 여정을 시작해요.</h2>
              <p>순서대로 입력하고 다음으로 넘어가세요.</p>
            </div>
          </header>

          <div className="onboarding-body">
            {onboardingStep === 0 && (
              <section className="onboarding-section is-visible">
                <div className="onboarding-section-inner compact">
                  <span className="onboarding-step">Step 1</span>
                  <div className="onboarding-panel">
                    <h3>기본 정보</h3>
                    <div className="onboarding-grid">
                      <div className="profile-photo-upload">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePhotoChange}
                        />
                        {signupDraft.base_photo_url && (
                          <button
                            type="button"
                            className="profile-remove"
                            aria-label="Remove profile photo"
                            onClick={() => {
                              setSignupDraft((prev) => ({
                                ...prev,
                                base_photo_url: null,
                              }));
                              setSignupPhotoFile(null);
                            }}
                          >
                            ×
                          </button>
                        )}
                        <div
                          className={`profile-icon ${signupDraft.base_photo_url ? "has-photo" : ""
                            }`}
                        >
                          {/* 1. 항상 'profile' 글자를 배경에 깔아둡니다 */}
                          <span className="profile-text">profile</span>

                          {/* 2. 이미지가 있으면 그 위에 덮어씌웁니다 */}
                          {signupDraft.base_photo_url && (
                            <img
                              src={signupDraft.base_photo_url}
                              alt="Profile"
                              /* ✨ 핵심: 이미지가 깨지면(에러나면) 스스로를 숨겨서 뒤에 있는 글자가 보이게 함 */
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          )}
                        </div>
                      </div>
                      <div className="name-fields">
                        <label className="onboarding-field">
                          이메일
                          <input
                            value={signupDraft.handle}
                            onChange={(event) =>
                              updateSignupField("handle", event.target.value)
                            }
                            placeholder="name@example.com"
                          />
                        </label>
                        <label className="onboarding-field">
                          실명
                          <input
                            value={signupDraft.name}
                            onChange={(event) =>
                              updateSignupField("name", event.target.value)
                            }
                            placeholder="홍길동"
                          />
                        </label>
                        <label className="onboarding-field">
                          비밀번호
                          <input
                            type="password"
                            value={signupDraft.password}
                            onChange={(event) =>
                              updateSignupField("password", event.target.value)
                            }
                            placeholder="비밀번호 입력"
                          />
                        </label>
                        <label className="onboarding-field">
                          비밀번호 확인
                          <input
                            type="password"
                            value={signupDraft.passwordConfirm}
                            onChange={(event) =>
                              updateSignupField(
                                "passwordConfirm",
                                event.target.value,
                              )
                            }
                            placeholder="비밀번호 재입력"
                          />
                        </label>
                      </div>
                    </div>
                    <p
                      className={`onboarding-hint ${showPasswordHint ? "is-visible" : "is-hidden"
                        }`}
                    >
                      비밀번호가 일치하지 않습니다.
                    </p>
                    <div className="onboarding-divider" />
                    <div className="measurements-head">
                      <h4>신체 수치</h4>
                      <div className="measurements-tabs">
                        <button
                          type="button"
                          className={
                            measurementMode === "ai"
                              ? "tab-btn active"
                              : "tab-btn"
                          }
                          onClick={() => setMeasurementMode("ai")}
                        >
                          사진 측정
                        </button>
                        <button
                          type="button"
                          className={
                            measurementMode === "manual"
                              ? "tab-btn active"
                              : "tab-btn"
                          }
                          onClick={() => setMeasurementMode("manual")}
                        >
                          직접 입력
                        </button>
                      </div>
                    </div>
                    <div className="measurement-container">
                      {measurementMode === "ai" ? (
                        <div className="ai-measure-panel">
                          <div className="ai-upload">
                            <div className="ai-upload-text">
                              <strong>전신 사진 업로드</strong>
                              <span>
                                {aiFileName ? (
                                  <span className="ai-file-name">
                                    {aiFileName}
                                    <button
                                      type="button"
                                      className="ai-file-remove"
                                      aria-label="Remove uploaded photo"
                                      onClick={() => {
                                        setAiFileName(null);
                                        if (aiPhotoInputRef.current) {
                                          aiPhotoInputRef.current.value = "";
                                        }
                                      }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ) : (
                                  "정면 전신 사진 1장을 업로드하면 AI가 자동으로 치수를 계산합니다."
                                )}
                              </span>
                            </div>
                            <label className="ai-upload-btn">
                              <svg
                                className="ai-upload-icon"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  d="M4 7h3l2-2h6l2 2h3v12H4z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinejoin="round"
                                />
                                <circle
                                  cx="12"
                                  cy="13"
                                  r="3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                />
                              </svg>
                              <input
                                ref={aiPhotoInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setAiFileName(file.name); // ✨ 선택된 파일 이름 저장
                                    // (필요하다면 여기에 이미지 처리 로직 추가)
                                  }
                                }}
                              />
                            </label>
                          </div>
                          {/* .ai-hint div는 base.css에서 숨겼으므로 코드는 그대로 둬도 안 보입니다 */}
                          <div className="ai-hint">
                            밝은 배경에서 정면 자세로 촬영된 이미지를
                            권장합니다.
                          </div>
                        </div>
                      ) : (
                        <div className="onboarding-measurements">
                          {signupMeasurementFields.map((field) => (
                            <label key={field.key} className="onboarding-field">
                              {field.label}
                              <input
                                type="number"
                                value={signupDraft.measurements[field.key]}
                                onChange={(event) =>
                                  updateSignupMeasurement(
                                    field.key,
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="onboarding-submit">
                      <button
                        type="button"
                        className="primary"
                        disabled={!canProceedProfile}
                        onClick={() => setOnboardingStep(1)}
                      >
                        다음
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {onboardingStep === 1 && (
              <section className="onboarding-section is-visible">
                <div className="onboarding-section-inner compact">
                  <span className="onboarding-step">Step 2</span>
                  <div className="onboarding-panel">
                    <div className="style-pick-title-row">
                      <h3>취향 선택</h3>
                      <div className="style-pick-title-meta">
                        <span>
                          선택 {selectedStyleIds.length}/{requiredStyleCount}
                        </span>
                      </div>
                    </div>
                    <div className="style-pick-grid">
                      {onboardingStyleItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`style-pick-card ${selectedStyleIds.includes(item.id) ? "selected" : ""
                            }`}
                          onClick={() => toggleStyleSelection(item.id)}
                        >
                          <div className="style-pick-media">
                            <img src={item.design_img_url} alt={item.name} />
                            <span
                              className="style-pick-check"
                              aria-hidden="true"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="onboarding-submit">
                      {!canFinishOnboarding && (
                        <p className="onboarding-hint is-visible">
                          최소 {requiredStyleCount}개 이상 선택해야합니다.
                        </p>
                      )}
                      <button
                        type="button"
                        className="primary"
                        aria-disabled={!canFinishOnboarding}
                        onClick={() => {
                          if (canFinishOnboarding) {
                            finalizeOnboarding();
                          }
                        }}
                      >
                        가입 완료
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  const appContent = (
    <div
      className={`app ${sidebarOpen ? "" : "sidebar-collapsed"} ${darkMode ? "dark" : ""
        }`}
    >
      {introOpen && (
        <div className="intro-overlay" role="dialog" aria-modal="true">
          <section className="intro-hero">
            <video
              className="intro-video"
              src="/background.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="intro-fade" />
            <div className="intro-title-block">
              <span className="intro-title-main">Modif</span>
              <span className="intro-title-sub">Mode + if</span>
            </div>
          </section>
          <section className="intro-content">
            <div className="intro-body intro-animate">
              <div className="intro-sections">
                <article className="intro-section" style={{ "--delay": "0ms" }}>
                  <span className="intro-keyword">Create</span>
                  <h3 className="intro-heading">상상이 디자인이 되는 순간</h3>
                  <p className="intro-desc">
                    텍스트 한 줄로 아이디어를 시각화하고,
                    <br />
                    누구나 디자이너가 되는 경험을 제공합니다.
                  </p>
                </article>
                <article
                  className="intro-section"
                  style={{ "--delay": "180ms" }}
                >
                  <span className="intro-keyword">Invest</span>
                  <h3 className="intro-heading">나의 안목이 자산이 되다</h3>
                  <p className="intro-desc">
                    가능성 있는 브랜드를 가장 먼저 발견하고,
                    <br />
                    단순 소비를 넘어 성장에 투자하세요.
                  </p>
                </article>
                <article
                  className="intro-section"
                  style={{ "--delay": "360ms" }}
                >
                  <span className="intro-keyword">Fit</span>
                  <h3 className="intro-heading">미리 입어보는 가상 피팅</h3>
                  <p className="intro-desc">
                    옷을 직접 레이어링 해보며
                    <br />
                    나에게 꼭 맞는 핏과 스타일을 미리 경험해 보세요.
                  </p>
                </article>
              </div>
              <div className="intro-actions">
                <button
                  type="button"
                  className="intro-btn intro-btn-ghost"
                  onClick={startOnboarding}
                >
                  시작하기
                </button>
                <button
                  type="button"
                  className="intro-btn"
                  onClick={() => {
                    setIntroOpen(false);
                    setActiveTab("discover");
                  }}
                >
                  둘러보기
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
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
            <span className="brand-mark">Modif</span>
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
              onClick={() =>
                item.key === "discover"
                  ? setActiveTab(item.key)
                  : handleRestrictedNav(item.key)
              }
              type="button"
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            className="ghost"
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
          >
            <span className="nav-label">Mode</span>
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
            <img src={darkMode ? "/logo.png" : "/logo2.png"} alt="Motif logo" />
          </button>
          <div className="search">
            <input
              type="text"
              placeholder="Search brands, creators, items..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setSearchOpen(false), 120);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && searchResults.length > 0) {
                  const first = searchResults[0];
                  if (first.type === "item") {
                    openClothingDetail(first.clothingId);
                  } else {
                    openBrandProfile(first.profile);
                  }
                }
              }}
            />
            <button className="search-btn" type="button" aria-label="Search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6" />
                <path d="M16 16l4 4" />
              </svg>
            </button>
            {searchOpen && searchResults.length > 0 && (
              <div className="search-results" role="listbox">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.label}`}
                    type="button"
                    className="search-result-item"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      if (result.type === "item") {
                        openClothingDetail(result.clothingId);
                      } else {
                        openBrandProfile(result.profile);
                      }
                    }}
                  >
                    <span className="search-result-type">
                      {result.type === "item" ? "Item" : "Brand"}
                    </span>
                    <div className="search-result-text">
                      <strong>{result.label}</strong>
                      <span>{result.sublabel}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="top-actions">
            {isLoggedIn ? (
              <button
                type="button"
                className="top-user-login"
                onClick={() => openAuthModal("logout-confirm")}
              >
                로그아웃
              </button>
            ) : (
              <button
                type="button"
                className="top-user-login"
                onClick={openLoginFlow}
              >
                로그인
              </button>
            )}
            <div className="notif-wrap">
              <button
                className="icon-btn"
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
                onClick={() => {
                  if (isLoggedIn) {
                    setNotificationOpen((prev) => !prev);
                  } else {
                    openAuthModal("login-required");
                  }
                }}
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
                      <strong>알림</strong>
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
                          <button
                            type="button"
                            className="notif-item"
                            onClick={() => openNotificationTarget(item)}
                          >
                            <strong>{item.title}</strong>
                            <span>{item.message}</span>
                          </button>
                          <button
                            className="notif-item-close"
                            type="button"
                            aria-label="Delete notification"
                            onClick={() => {
                              setNotifications((prev) =>
                                prev.map((notice) =>
                                  notice.id === item.id
                                    ? { ...notice, removing: true }
                                    : notice,
                                ),
                              );
                              window.setTimeout(() => {
                                setNotifications((prev) =>
                                  prev.filter(
                                    (notice) => notice.id !== item.id,
                                  ),
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
                if (isLoggedIn) {
                  setActiveTab("profile");
                  setDetailItem(null);
                } else {
                  openAuthModal("login-required");
                }
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
              <p>취향을 넘어선 새로운 브랜드의 발견</p>
            </div>

            <div className="tag-row">
              <div className="tag-line">
                {selectedMainCategory === "All" ? (
                  <div className="tag-group">
                    {mainCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={`tag ${selectedMainCategory === category ? "active" : ""
                          }`}
                        onClick={() => {
                          setSelectedMainCategory(category);
                          setSelectedSubCategory("All");
                        }}
                      >
                        {mainCategoryLabels[category]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="tag-group">
                    <button
                      type="button"
                      className="tag active"
                      onClick={() => setSelectedSubCategory("All")}
                    >
                      <span className="tag-label">
                        {mainCategoryLabels[selectedMainCategory]}
                      </span>
                      <span
                        className="tag-clear"
                        role="button"
                        aria-label="Clear main category"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedMainCategory("All");
                          setSelectedSubCategory("All");
                        }}
                      >
                        ×
                      </span>
                    </button>
                    {subCategories
                      .filter((category) => category !== "All")
                      .map((category) => (
                        <button
                          key={category}
                          type="button"
                          className={`tag ${selectedSubCategory === category ? "active" : ""
                            }`}
                          onClick={() => setSelectedSubCategory(category)}
                        >
                          <span className="tag-label">{category}</span>
                          {selectedSubCategory === category && (
                            <span
                              className="tag-clear"
                              role="button"
                              aria-label="Clear sub category"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedSubCategory("All");
                              }}
                            >
                              ×
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                )}
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
                      성별
                      <select
                        value={selectedGender}
                        onChange={(event) =>
                          setSelectedGender(event.target.value)
                        }
                      >
                        {[
                          { value: "All", label: "전체" },
                          { value: "Mens", label: "남자" },
                          { value: "Womens", label: "여자" },
                          { value: "Unisex", label: "공용" },
                        ].map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="filter-field">
                      스타일
                      <select
                        value={selectedStyle}
                        onChange={(event) =>
                          setSelectedStyle(event.target.value)
                        }
                      >
                        {[
                          { value: "All", label: "전체" },
                          { value: "Minimal", label: "미니멀" },
                          { value: "Street", label: "스트릿" },
                          { value: "Classic", label: "클래식" },
                          { value: "Sport", label: "스포티" },
                          { value: "Romantic", label: "로맨틱" },
                        ].map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="filter-reset"
                      type="button"
                      onClick={resetFilters}
                    >
                      초기화
                    </button>
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
                  100,
                );

                return (
                  <article
                    className="card discover-card"
                    key={item.id}
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div
                      className="card-media"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        openClothingDetail(cloth.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openClothingDetail(cloth.id);
                        }
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
                    </div>
                    <div className="card-body">
                      <div className="card-title">
                        <div className="card-title-row">
                          <button
                            type="button"
                            className="brand-link"
                            onClick={() => {
                              const profile =
                                brandProfileMap[
                                item.designer_handle?.toLowerCase()
                                ] || brandProfileMap[item.brand.toLowerCase()];
                              if (profile) {
                                openBrandProfile(profile);
                              }
                            }}
                          >
                            {item.brand}
                          </button>
                          <span className="price-inline">
                            {currency.format(
                              clothingMap[item.clothing_id]?.price || 0,
                            )}
                          </span>
                        </div>
                        <div className="card-meta-row">
                          <span className="designer-handle">
                            {item.designer_handle}
                          </span>
                          <span className="participant">
                            {item.participant_count}명 참여
                          </span>
                        </div>
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
                    onClick={() => {
                      setDetailItem(null);
                    }}
                    type="button"
                  >
                    ×
                  </button>
                  <div className="modal-stack">
                    <div className="modal-header">
                      <div>
                        <button
                          type="button"
                          className="brand-link"
                          onClick={() => {
                            const profile =
                              brandProfileMap[
                              detailItem.funding.designer_handle?.toLowerCase()
                              ] ||
                              brandProfileMap[
                              detailItem.funding.brand.toLowerCase()
                              ];
                            if (profile) {
                              openBrandProfile(profile);
                            }
                          }}
                        >
                          {detailItem.funding.brand}
                        </button>
                        <p>{detailItem.clothing?.name}</p>
                      </div>
                      <div className="pill-group">
                        {["overview", "story", "feedback"].map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            className={`pill ${detailTab === tab ? "active" : ""
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
                      <div
                        className={`detail-scroll ${detailTab === "feedback" ? "detail-scroll-feedback" : ""
                          }`}
                      >
                        {detailTab === "overview" && (
                          <div className="detail-block">
                            <div className="price-row">
                              <div className="price-main">
                                <span className="price-label">Price</span>
                                <strong className="price-strong">
                                  {currency.format(
                                    detailItem.clothing?.price || 0,
                                  )}
                                </strong>
                              </div>
                              <button
                                type="button"
                                className="primary detail-fund-btn"
                                onClick={handleFundNow}
                              >
                                펀딩하기
                              </button>
                              <div className="price-like-row">
                                <button
                                  type="button"
                                  className={`like-count-inline subtle ${detailItem.funding.liked ? "liked" : ""
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
                            </div>
                            <h4>옷 세부내용</h4>
                            <p>
                              {detailItem.clothing?.description ||
                                `${detailItem.clothing?.name}은(는) 절제된 실루엣과 깔끔한 마감으로 일상과 포멀 모두에 어울립니다.`}
                            </p>
                            {detailTags.length > 0 && (
                              <div className="detail-tags">
                                {detailTags.map((tag) => (
                                  <button
                                    key={tag}
                                    type="button"
                                    className="detail-tag"
                                    onClick={() => handleDetailTagClick(tag)}
                                  >
                                    #{tag}
                                  </button>
                                ))}
                              </div>
                            )}
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
                            <div className="spec-bar">
                              {[
                                { label: "신축성", value: fabric.stretch },
                                { label: "두께감", value: fabric.weight },
                                { label: "탄탄함", value: fabric.stiffness },
                              ].map((item) => (
                                <div className="spec-bar-row" key={item.label}>
                                  <span>{item.label}</span>
                                  <div className="spec-track">
                                    <div
                                      className="spec-fill"
                                      style={{
                                        width: `${(item.value / 10) * 100}%`,
                                      }}
                                    />
                                  </div>
                                  <strong>{item.value}/10</strong>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {detailTab === "story" && (
                          <div className="detail-block">
                            <h4>브랜드 스토리</h4>
                            <p>
                              {detailItem.clothing?.story ||
                                `${detailItem.funding.brand}는 장인 정신과 데이터 기반 디자인을 결합해 지속 가능한 컬렉션을 선보입니다. 이번 라인업은 도시적인 실루엣과 실용적 디테일을 강조하며, 고객 피드백을 빠르게 반영하는 것을 목표로 합니다.`}
                            </p>
                            <div className="story-meta">
                              <div className="story-row">
                                <span>목표/현재</span>
                                <strong>
                                  목표{" "}
                                  {currency.format(
                                    detailItem.funding.goal_amount,
                                  )}{" "}
                                  · 현재{" "}
                                  {currency.format(
                                    detailItem.funding.current_amount,
                                  )}
                                </strong>
                                <div className="story-bar">
                                  <div
                                    className="story-fill"
                                    style={{ width: `${detailProgress}%` }}
                                  />
                                  <span className="story-percent">
                                    {detailProgress}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {detailTab === "feedback" && (
                          <div className="detail-block feedback-block">
                            <div className="detail-title-row">
                              <h4>소셜 피드백</h4>
                              <div className="rating-summary">
                                <span className="rating-label">★</span>
                                <strong>{detailAverageRating}</strong>
                              </div>
                            </div>
                            <div className="comment-list compact">
                              {comments.filter(
                                (comment) =>
                                  comment.clothing_id ===
                                  detailItem.clothing?.id,
                              ).length === 0 ? (
                                <div className="comment-empty">
                                  첫 피드백을 등록해보세요
                                </div>
                              ) : (
                                comments
                                  .filter(
                                    (comment) =>
                                      comment.clothing_id ===
                                      detailItem.clothing?.id,
                                  )
                                  .map((comment) => (
                                    <div
                                      key={comment.id}
                                      className={`comment compact ${comment.parent_id && comment.is_creator
                                        ? "reply"
                                        : ""
                                        }`}
                                    >
                                      {comment.parent_id && (
                                        <span className="reply-icon" aria-hidden="true">
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M9 14l-4-4 4-4" />
                                            <path d="M5 10h8a6 6 0 0 1 6 6v1" />
                                          </svg>
                                        </span>
                                      )}
                                      <div className="comment-rating">
                                        {Array.from({ length: 5 }).map(
                                          (_, index) => (
                                            <span
                                              key={index}
                                              className={`star-icon ${index < comment.rating
                                                ? "active"
                                                : ""
                                                }`}
                                            >
                                              ★
                                            </span>
                                          ),
                                        )}
                                      </div>
                                      <div className="comment-body">
                                        <div className="comment-meta">
                                          <div className="comment-user">
                                            <strong>{comment.user}</strong>
                                            {comment.parent_id &&
                                              comment.is_creator && (
                                                <span className="creator-badge">
                                                  창작자
                                                </span>
                                              )}
                                          </div>
                                        </div>
                                        <span>{comment.text}</span>
                                      </div>
                                      <div className="comment-menu">
                                        <span className="comment-time">
                                          {formatRelative(
                                            comment.created_at || new Date(),
                                          )}
                                        </span>
                                        <button
                                          type="button"
                                          className="comment-menu-btn"
                                          aria-label="Comment actions"
                                          onClick={() =>
                                            setCommentMenuId((prev) =>
                                              prev === comment.id
                                                ? null
                                                : comment.id,
                                            )
                                          }
                                        >
                                          ...
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
                                                      item.id !== comment.id,
                                                  ),
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
                                <div className="comment-rating-input">
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      className={`star-btn ${index < commentDraft.rating
                                        ? "active"
                                        : ""
                                        }`}
                                      aria-label={`Rate ${index + 1} stars`}
                                      onClick={() =>
                                        setCommentDraft((prev) => ({
                                          ...prev,
                                          rating: index + 1,
                                        }))
                                      }
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
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
            <div className="page-title page-title-row">
              <div>
                <h1>Studio</h1>
                <p>상상이 현실이 되는 크리에이티브 공간</p>
              </div>
              <div className="page-title-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setIsGalleryOpen(true)}
                >
                  저장된 디자인
                </button>
              </div>
            </div>

            <div className="studio-layout">
              <div className="panel studio-workbench">
                <div className="studio-workbench-header">
                  <div>
                    <h3>디자인 워크벤치</h3>
                    <p className="studio-sub">
                      스케치와 프롬프트를 함께 사용해 AI 디자인을 생성합니다.
                    </p>
                  </div>
                  <div className="studio-workbench-actions">
                    <button
                      type="button"
                      className="design-coin"
                      onClick={() => setDesignCoinModal(true)}
                    >
                      <span className="design-coin-icon" aria-hidden="true">
                        <svg
                          className="design-coin-brush"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 20c2.2 0 4-1.8 4-4 0-1.1.9-2 2-2h4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 4l8 8-6 6-8-8z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10 6l8 8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <span className="design-coin-count">{designCoins}</span>
                    </button>
                    <button
                      className="secondary temp-save-btn"
                      type="button"
                      onClick={() =>
                        setNameModal({
                          open: true,
                          type: "temp-design",
                          value: prompt.trim() || "임시 스케치",
                          view: null,
                        })
                      }
                    >
                      임시 저장
                    </button>
                    <button
                      className="primary"
                      type="button"
                      onClick={() => {
                        if (!ensureBrandForDesign()) return;
                        if (designCoins <= 0) return;
                        setDesignGenerateConfirmOpen(true);
                      }}
                      disabled={designCoins <= 0}
                    >
                      디자인 생성
                    </button>
                  </div>
                </div>
                <div className="workbench-body">
                  <div className="workbench-canvas">
                    <div className="design-toolbar">
                      <div className="tool-group">
                        <button
                          type="button"
                          className={`tool-btn ${designTool === "brush" ? "active" : ""
                            }`}
                          onClick={() => {
                            setDesignTool("brush");
                            setShowClearBubble(false);
                          }}
                          aria-label="Brush"
                          title="Brush"
                        >
                          <Pencil size={16} strokeWidth={1.6} />
                        </button>
                        <div className="tool-anchor">
                          <button
                            type="button"
                            className={`tool-btn ${designTool === "eraser" ? "active" : ""
                              }`}
                            onClick={() => {
                              if (designTool === "eraser") {
                                setShowClearBubble((prev) => !prev);
                              } else {
                                setDesignTool("eraser");
                                setShowClearBubble(false);
                              }
                            }}
                            aria-label="Eraser"
                            title="Eraser"
                          >
                            <Eraser size={16} strokeWidth={1.6} />
                          </button>
                          <div
                            className={`tool-sub ${designTool === "eraser" && showClearBubble
                              ? "is-visible"
                              : ""
                              }`}
                          >
                            <div className="bubble">
                              <button
                                type="button"
                                className="clear-btn"
                                onClick={clearDesignCanvas}
                              >
                                모두 지우기
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <label className="color-picker">
                        색상
                        <input
                          type="color"
                          value={designColor}
                          onChange={(event) =>
                            setDesignColor(event.target.value)
                          }
                          aria-label="Brush color"
                        />
                      </label>
                      <label className="size-control">
                        굵기
                        <input
                          type="range"
                          min="2"
                          max="14"
                          value={designSize}
                          onChange={(event) =>
                            setDesignSize(Number(event.target.value))
                          }
                        />
                      </label>
                      <div className="canvas-photo-actions">
                        <button
                          type="button"
                          className="canvas-photo-btn"
                          onClick={() => designPhotoInputRef.current?.click()}
                          aria-label="Upload photo"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path
                              d="M7 7l1.5-2h7L17 7h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2z"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="13"
                              r="3.2"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                          </svg>
                        </button>
                        {designPhoto?.url && (
                          <button
                            type="button"
                            className="canvas-photo-clear"
                            onClick={clearDesignPhoto}
                            aria-label="Remove photo"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="design-canvas-wrap">
                      <div className="design-canvas-area">
                        <div className="design-canvas-frame">
                          <div className="studio-side-toggle">
                            <button
                              type="button"
                              className={studioSide === "front" ? "active" : ""}
                              onClick={() => switchStudioSide("front")}
                            >
                              앞면
                            </button>
                            <button
                              type="button"
                              className={studioSide === "back" ? "active" : ""}
                              onClick={() => switchStudioSide("back")}
                            >
                              뒷면
                            </button>
                          </div>
                          {designPhoto?.url && (
                            <img
                              className="design-photo-preview"
                              src={designPhoto.url}
                              alt={designPhoto.name || "Design reference"}
                            />
                          )}
                          <canvas
                            ref={designCanvasRef}
                            className="design-canvas"
                            style={{ cursor: "crosshair" }}
                            width="720"
                            height="420"
                            onMouseDown={handleCanvasDraw}
                            aria-label="Design canvas"
                          />
                        </div>
                        <input
                          ref={designPhotoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleDesignPhotoChange}
                          className="canvas-photo-input"
                        />
                      </div>
                      <p className="design-hint">
                        {designCategory} 실루엣을 드로잉하세요. 클릭하면 전체
                        화면으로 이동합니다.
                      </p>
                    </div>
                  </div>
                  <div className="workbench-prompt">
                    <div className="design-selects">
                      <label className="field">
                        성별
                        <select
                          value={designGender}
                          onChange={(event) =>
                            setDesignGender(event.target.value)
                          }
                        >
                          {[
                            { value: "Mens", label: "남자" },
                            { value: "Womens", label: "여자" },
                            { value: "Unisex", label: "공용" },
                          ].map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        옷 종류
                        <select
                          value={designCategory}
                          onChange={(event) => {
                            const nextCategory = event.target.value;
                            setDesignCategory(nextCategory);
                            const nextOptions =
                              designLengthOptions[nextCategory] || [];
                            if (
                              nextOptions.length &&
                              !nextOptions.includes(designLength)
                            ) {
                              setDesignLength(nextOptions[0]);
                            }
                          }}
                        >
                          {["상의", "하의", "아우터", "원피스"].map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        기장
                        <select
                          value={designLength}
                          onChange={(event) =>
                            setDesignLength(event.target.value)
                          }
                        >
                          {(designLengthOptions[designCategory] || []).map(
                            (item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                    </div>
                    <div className="subsection">
                      <h4>원단 특성</h4>
                      {["신축성", "두께감", "탄탄함"].map((key) => (
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
                    <label className="field">
                      디자인 프롬프트
                      <textarea
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        placeholder="미니멀한 오버사이즈 코트, 대칭적인 라펠과 깊은 블랙 톤"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "fitting" && (
          <section className="content">
            <div className="page-title page-title-row">
              <div>
                <h1>My Fitting</h1>
                <p>데이터로 완성하는 나만의 가상 드레스룸</p>
              </div>
              <div className="page-title-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setFittingAlbumOpen(true)}
                >
                  피팅 앨범
                </button>
              </div>
            </div>

            <div className="fitting-layout">
              <div className="fitting-preview">
                <div className="fitting-toggle">
                  <button
                    type="button"
                    className={fittingView === "3d" ? "active" : ""}
                    onClick={() => setFittingView("3d")}
                  >
                    마네킹
                  </button>
                  <button
                    type="button"
                    className={fittingView === "real" ? "active" : ""}
                    onClick={() => setFittingView("real")}
                  >
                    실물
                  </button>
                </div>
                <button
                  type="button"
                  className="fitting-save-btn"
                  onClick={() =>
                    setNameModal({
                      open: true,
                      type: "fitting",
                      value:
                        fittingView === "3d" ? "3D Snapshot" : "Real Snapshot",
                      view: fittingView,
                    })
                  }
                >
                  저장
                </button>
                {fittingView === "3d" ? (
                  <Canvas
                    camera={{ position: [0, 0, 1.5], fov: 45 }}
                    gl={{ preserveDrawingBuffer: true }}
                    onCreated={({ gl }) => {
                      fittingCanvasRef.current = gl.domElement;
                    }}
                  >
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[2, 2, 2]} intensity={0.8} />
                    <OrbitControls enablePan={false} />
                    <Suspense fallback={null}>
                      <Environment preset="city" />
                      <Center>
                        <Tshirt />
                      </Center>
                    </Suspense>
                  </Canvas>
                ) : (
                  <div
                    className="fitting-real"
                    onWheel={(event) => {
                      event.preventDefault();
                      const delta = event.deltaY > 0 ? -0.08 : 0.08;
                      setFittingZoom((prev) => clamp(prev + delta, 0.7, 1.8));
                    }}
                  >
                    <img
                      className="fitting-real-base"
                      src={fittingRealBaseUrl}
                      alt="model"
                      style={{
                        transform: `scale(${fittingZoom})`,
                        transformOrigin: "center",
                      }}
                    />
                    {fittingLayers.length > 0 && (
                      <div
                        className="layer-stack"
                        style={{
                          transform: `scale(${fittingZoom})`,
                          transformOrigin: "center",
                        }}
                      >
                        {fittingLayers.map((id) => (
                          <img
                            key={id}
                            src={clothingMap[id]?.design_img_url}
                            alt={clothingMap[id]?.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {isComposing && <div className="compose">AI 합성 중...</div>}
              </div>

              <div className="fitting-panel">
                <div className="panel-block layer-panel">
                  <div className="layer-panel-header">
                    <h3>레이어링 피팅</h3>
                    <button
                      type="button"
                      className="layer-apply-btn"
                      onClick={() => setFittingLayers(fittingLayersDraft)}
                    >
                      Fitting
                    </button>
                  </div>
                  <div className="layer-list">
                    {fittingLayersDraft.map((id, index) => (
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
                    {fittingLayersDraft.length === 0 && (
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
                    className={`closet-card ${focusClothingId === item.id ? "selected" : ""
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
                              : funding,
                          ),
                        );
                      }}
                    >
                      ×
                    </button>
                    <button
                      type="button"
                      className="closet-link"
                      onClick={() => {
                        openClothingDetail(item.id);
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
                        setFittingLayersDraft((prev) =>
                          prev.includes(item.id) ? prev : [...prev, item.id],
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
            {fittingAlbumOpen && (
              <div className="modal" role="dialog" aria-modal="true">
                <div
                  className={`modal-content album-modal-content ${fittingHistory.length <= 2 ? "compact" : ""
                    }`}
                >
                  <button
                    className="close"
                    type="button"
                    onClick={() => setFittingAlbumOpen(false)}
                  >
                    ×
                  </button>
                  <div className="album-modal-header">
                    <h3>Fitting Album</h3>
                    <span>{fittingHistory.length} items</span>
                  </div>
                  <div className="album">
                    {fittingHistory.map((item) => (
                      <div key={item.id} className="album-card">
                        <button
                          type="button"
                          className="album-remove"
                          aria-label="Remove album item"
                          onClick={() =>
                            setFittingHistory((prev) =>
                              prev.filter((entry) => entry.id !== item.id),
                            )
                          }
                        >
                          ×
                        </button>
                        <img src={item.image} alt={item.title} />
                        <div className="album-meta">
                          <div className="album-meta-row">
                            <strong>{item.title}</strong>
                            <button
                              type="button"
                              className="album-load-btn"
                              onClick={() => {
                                setFittingRealBaseUrl(item.image);
                                setFittingView("real");
                                setFittingLayers([]);
                                setFittingAlbumOpen(false);
                              }}
                            >
                              불러오기
                            </button>
                          </div>
                          <span>{formatAlbumDate(item.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "portfolio" && (
          <section className="content">
            <div className="portfolio-head">
              <div className="page-title">
                <h1>Portfolio</h1>
                <p>안목이 자산이 되는 패션 투자 대시보드</p>
              </div>
              <div className="portfolio-tabs">
                <button
                  type="button"
                  className={`pill ${portfolioTab === "investee" ? "active" : ""
                    }`}
                  onClick={() => setPortfolioTab("investee")}
                >
                  Investee
                </button>
                <button
                  type="button"
                  className={`pill ${portfolioTab === "investor" ? "active" : ""
                    }`}
                  onClick={() => setPortfolioTab("investor")}
                >
                  Investor
                </button>
              </div>
            </div>

            {portfolioTab === "investee" && (
              <div className="portfolio-grid portfolio-brands-layout">
                <div className="panel my-brands-panel">
                  <div className="panel-title-row">
                    <h3>My Brands</h3>
                    {brands.length > 2 && (
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => setBrandFundingOpen(true)}
                      >
                        더보기
                      </button>
                    )}
                  </div>
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
                    {brands.slice(0, 2).map((item) => (
                      <div key={item.id} className="brand-card">
                        <div>
                          <strong>{item.brand}</strong>
                          <p>
                            참여 {item.participantCount}명 · ₩{" "}
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

                <div className="portfolio-side">
                  <div className="brand-page-panel">
                    <h3>Brand Page</h3>
                    {hasBrandPage ? (
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => openBrandProfile(myBrandProfile)}
                      >
                        내 브랜드 페이지
                      </button>
                    ) : (
                      <>
                        <p>브랜드 페이지를 만들어 포트폴리오를 시작하세요.</p>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => setBrandCreatePromptOpen(true)}
                        >
                          브랜드 페이지 만들기
                        </button>
                      </>
                    )}
                  </div>
                  <div className="panel">
                    <h3>Followers & Following</h3>
                    <div className="follow-stats">
                      <button
                        type="button"
                        className="follow-stat-btn"
                        onClick={() => setPortfolioListOpen("followers")}
                      >
                        <strong>{currentFollowerCount}</strong>
                        <span>Followers</span>
                      </button>
                      <button
                        type="button"
                        className="follow-stat-btn"
                        onClick={() => setPortfolioListOpen("following")}
                      >
                        <strong>{followingCount}</strong>
                        <span>Following</span>
                      </button>
                    </div>
                    <div className="follow-chart">
                      <div className="follow-chart-grid">
                        <div className="follow-chart-y">
                          {followerTicks.map((tick) => (
                            <span key={tick}>{tick}</span>
                          ))}
                        </div>
                        <div className="follow-chart-scroll">
                          <div
                            className="follow-chart-canvas"
                            style={{ width: `${followerChartWidth}px` }}
                          >
                            <svg
                              viewBox={`0 0 ${followerChartWidth} 120`}
                              aria-hidden="true"
                            >
                              <polyline
                                points={followerChartPoints}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="follow-chart-line"
                              />
                            </svg>
                            <div className="follow-chart-x">
                              {effectiveFollowerSeries.map((item, index) => (
                                <span
                                  key={item.date}
                                  style={{
                                    left: `${index * followerChartStep}px`,
                                  }}
                                >
                                  {item.date}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="follow-chart-meta">
                        <span>최근 증가</span>
                        <strong>
                          +{currentFollowerCount - followerSeries[0].value}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {portfolioTab === "investor" && (
              <div className="portfolio-grid single">
                <div className="panel">
                  <h3>My Investments</h3>
                  <div className="investment-list">
                    {investments.length === 0 ? (
                      <p className="empty">펀딩한 내역이 없습니다.</p>
                    ) : (
                      investments.map((item) => {
                        const matchedClothing = clothing.find(
                          (cloth) =>
                            cloth.name?.toLowerCase() ===
                            item.itemName.toLowerCase(),
                        );
                        const matchedBrand =
                          brandProfileMap[item.brand.toLowerCase()] || null;

                        return (
                          <div key={item.id} className="investment-card">
                            <button
                              type="button"
                              className="investment-media"
                              onClick={() => {
                                if (!matchedClothing) return;
                                openClothingDetail(matchedClothing.id);
                              }}
                            >
                              <img src={item.image} alt={item.itemName} />
                            </button>
                            <div>
                              <button
                                type="button"
                                className="investment-brand"
                                onClick={() => {
                                  if (!matchedBrand) return;
                                  openBrandProfile(matchedBrand);
                                  setActiveTab("portfolio");
                                }}
                              >
                                {item.brand}
                              </button>
                              <button
                                type="button"
                                className="investment-item"
                                onClick={() => {
                                  if (!matchedClothing) return;
                                  openClothingDetail(matchedClothing.id);
                                }}
                              >
                                {item.itemName}
                              </button>
                              <span className="status">{item.status}</span>
                              <span className="eta">예상 배송: {item.eta}</span>
                            </div>
                            <div className="investment-actions">
                              <strong className="investment-price">
                                ₩{currency.format(item.amount)}
                              </strong>
                              <button
                                type="button"
                                className="ghost"
                                onClick={() =>
                                  setCancelFundingModal({
                                    open: true,
                                    investmentId: item.id,
                                  })
                                }
                              >
                                펀딩 취소
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {portfolioListOpen && (
              <div className="modal" role="dialog" aria-modal="true">
                <div className="modal-content follow-modal">
                  <button
                    className="close"
                    type="button"
                    onClick={() => setPortfolioListOpen(null)}
                  >
                    ×
                  </button>
                  <div className="follow-modal-header">
                    <h3>
                      {portfolioListOpen === "followers"
                        ? "Followers"
                        : "Following"}
                    </h3>
                    <span>
                      {portfolioListOpen === "followers"
                        ? followerProfiles.length
                        : followingProfiles.length}
                    </span>
                  </div>
                  <div className="follow-modal-list">
                    {portfolioListOpen === "followers"
                      ? followerProfiles.map((profile) => (
                        <div
                          key={profile.handle}
                          className="follow-list-item"
                        >
                          <div>
                            <strong>{profile.name}</strong>
                            <span>{profile.handle}</span>
                          </div>
                          <button
                            type="button"
                            className={`follow-cta ${followedBrands.includes(profile.handle)
                              ? "is-mutual"
                              : ""
                              }`}
                            onClick={() => toggleFollowBrand(profile.handle)}
                          >
                            {followedBrands.includes(profile.handle)
                              ? "맞팔로우"
                              : "팔로우"}
                          </button>
                        </div>
                      ))
                      : followingProfiles.map((profile) => (
                        <div
                          key={profile.handle}
                          className="follow-list-item"
                        >
                          <div>
                            <strong>{profile.brand}</strong>
                            <span>{profile.handle}</span>
                          </div>
                          <button
                            type="button"
                            className="ghost"
                            onClick={() => toggleFollowBrand(profile.handle)}
                          >
                            Unfollow
                          </button>
                        </div>
                      ))}
                    {portfolioListOpen === "following" &&
                      followingProfiles.length === 0 && (
                        <div className="follow-empty">
                          팔로우 중인 브랜드가 없습니다.
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "brand" && selectedBrandProfile && (
          <section className="content">
            <div className="page-title brand-title brand-title-row">
              <div>
                <h1>{selectedBrandProfile.brand}</h1>
              </div>
              {selectedBrandProfile.handle === myBrandDetails.handle &&
                hasBrandPage && (
                  <div className="brand-title-actions">
                    <button
                      type="button"
                      className="brand-edit-btn"
                      aria-label={
                        !brandPageReady
                          ? "Create brand profile"
                          : brandEditing
                            ? "Save brand profile"
                            : "Edit brand profile"
                      }
                      onClick={() => {
                        if (brandEditing || !brandPageReady) {
                          if (!brandPageReady) {
                            handleCreateBrand();
                            return;
                          }
                          if (brandEditing) {
                            handleUpdateBrand();
                          }
                        } else {
                          setBrandEditing(true);
                        }
                      }}
                    >
                      {!brandPageReady ? (
                        "생성"
                      ) : brandEditing ? (
                        "저장"
                      ) : (
                        <Pencil size={16} strokeWidth={1.6} />
                      )}
                    </button>
                    {brandPageReady && (
                      <button
                        type="button"
                        className="brand-delete-btn"
                        aria-label="Delete brand profile"
                        onClick={() => setBrandDeleteConfirmOpen(true)}
                      >
                        <Trash2 size={16} strokeWidth={1.6} />
                      </button>
                    )}
                  </div>
                )}
            </div>

            <div className="brand-hero">
              <div className="brand-hero-card">
                <div className="brand-hero-info">
                  {brandEditing &&
                    selectedBrandProfile.handle === myBrandDetails.handle ? (
                    <>
                      <div className="brand-logo-upload">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (event) => {
                            const file = event.target.files[0];
                            if (!file) return;
                            if (!window.localStorage.getItem("token")) {
                              openAuthModal("login-required");
                              return;
                            }
                            try {
                              const { url } = await uploadBrandLogo(file);
                              setMyBrandDetails((prev) => ({
                                ...prev,
                                logoUrl: normalizeAssetUrl(url),
                              }));
                            } catch (err) {
                              console.error(err);
                              alert(
                                err.response?.data?.message ||
                                "브랜드 로고 업로드에 실패했습니다.",
                              );
                            }
                          }}
                        />
                        {myBrandDetails.logoUrl ? (
                          <>
                            <img
                              src={myBrandDetails.logoUrl}
                              alt="Brand logo"
                            />
                            <button
                              type="button"
                              className="brand-logo-remove"
                              aria-label="Remove brand logo"
                              onClick={() =>
                                setMyBrandDetails((prev) => ({
                                  ...prev,
                                  logoUrl: "",
                                }))
                              }
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <span>로고 등록</span>
                        )}
                      </div>
                      <input
                        value={myBrandDetails.brand}
                        onChange={(event) =>
                          setMyBrandDetails((prev) => ({
                            ...prev,
                            brand: event.target.value,
                          }))
                        }
                      />
                      <textarea
                        rows="3"
                        value={myBrandDetails.bio}
                        onChange={(event) =>
                          setMyBrandDetails((prev) => ({
                            ...prev,
                            bio: event.target.value,
                          }))
                        }
                      />
                    </>
                  ) : (
                    <>
                      <img
                        className="brand-hero-logo"
                        src={
                          selectedBrandProfile.handle === myBrandDetails.handle
                            ? myBrandDetails.logoUrl
                            : selectedBrandProfile.logoUrl
                        }
                        alt={`${selectedBrandProfile.brand} logo`}
                      />
                      <strong>{selectedBrandProfile.brand}</strong>
                      <p>{selectedBrandProfile.bio}</p>
                    </>
                  )}
                </div>
                <div className="brand-hero-actions">
                  {selectedBrandProfile.handle !== myBrandDetails.handle && (
                    <button
                      type="button"
                      className={
                        followedBrands.includes(selectedBrandProfile.handle)
                          ? "secondary"
                          : "primary"
                      }
                      onClick={() =>
                        toggleFollowBrand(selectedBrandProfile.handle)
                      }
                    >
                      {followedBrands.includes(selectedBrandProfile.handle)
                        ? "Following"
                        : "Follow"}
                    </button>
                  )}
                </div>
              </div>

              <div className="brand-stats">
                <div>
                  <strong>{selectedBrandProfile.followerCount}</strong>
                  <span>Followers</span>
                </div>
                <div>
                  <strong>{brandFeed.length}</strong>
                  <span>Designs</span>
                </div>
              </div>
            </div>

            <div className="brand-feed">
              {brandFeed.length === 0 ? (
                <p className="empty empty-brand">등록된 디자인이 없습니다.</p>
              ) : (
                brandFeed.map((entry) => (
                  <button
                    key={entry.clothing.id}
                    type="button"
                    className="brand-feed-card"
                    onClick={() => openClothingDetail(entry.clothing.id)}
                  >
                    <img
                      src={entry.clothing.design_img_url}
                      alt={entry.clothing.name}
                    />
                    <div>
                      <strong>{entry.clothing.name}</strong>
                      <span>
                        {currency.format(entry.clothing.price)} ·{" "}
                        {entry.funding.participant_count}명 참여
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "profile" && (
          <section className="content">
            <div className="page-title">
              <h1>Profile</h1>
              <p>나의 기본 정보를 확인하고 수정합니다.</p>
            </div>

            <div className="profile-center">
              <div className="panel profile-card">
                <div className="profile-top">
                  <div className="profile-photo-area">
                    <div className="profile-photo-actions">
                      <div className="profile-photo-toggle">
                        <button
                          type="button"
                          className={
                            profilePhotoMode === "profile" ? "active" : ""
                          }
                          onClick={() => setProfilePhotoMode("profile")}
                        >
                          프로필
                        </button>
                        <button
                          type="button"
                          className={profilePhotoMode === "body" ? "active" : ""}
                          onClick={() => setProfilePhotoMode("body")}
                        >
                          전신
                        </button>
                      </div>
                      {isProfileEditing &&
                        ((profilePhotoMode === "profile" &&
                          userProfile.profile_photo_url) ||
                          (profilePhotoMode === "body" &&
                            userProfile.base_photo_url)) && (
                          <button
                            type="button"
                            className="profile-photo-remove"
                            aria-label="Remove photo"
                            onClick={() => {
                              if (profilePhotoMode === "profile") {
                                updateProfileField("profile_photo_url", null);
                              } else {
                                updateProfileField("base_photo_url", null);
                              }
                            }}
                          >
                            ×
                          </button>
                        )}
                    </div>
                    <div className="profile-photo-box">
                      <label className="profile-photo-frame">
                        {profilePhotoMode === "profile" &&
                          userProfile.profile_photo_url ? (
                          <img
                            className="profile-photo"
                            src={userProfile.profile_photo_url}
                            alt="profile"
                          />
                        ) : profilePhotoMode === "body" &&
                          userProfile.base_photo_url ? (
                          <img
                            className="profile-photo"
                            src={userProfile.base_photo_url}
                            alt="body"
                          />
                        ) : (
                          <span className="profile-photo-placeholder">사진</span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={!isProfileEditing}
                          onClick={(event) => {
                            event.target.value = null;
                          }}
                          onChange={handleProfilePhotoUpload}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="profile-main">
                    <div className="profile-main-header">
                      <div className="profile-identity">
                        {isProfileEditing ? (
                          <>
                            <input
                              className="profile-identity-input"
                              value={userProfile.name}
                              onChange={(event) =>
                                updateProfileField("name", event.target.value)
                              }
                              placeholder="이름"
                            />
                            <input
                              className="profile-identity-input"
                              value={userProfile.handle}
                              onChange={(event) =>
                                updateProfileField("handle", event.target.value)
                              }
                              placeholder="@handle"
                            />
                          </>
                        ) : (
                          <>
                            <h3>{userProfile.name}</h3>
                            <span>{userProfile.handle}</span>
                          </>
                        )}
                      </div>
                      <div className="profile-main-actions">
                        <button
                          type="button"
                          className="profile-coin"
                          onClick={() => setDesignCoinModal(true)}
                        >
                          <span className="profile-coin-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path
                                d="M4 20c2.2 0 4-1.8 4-4 0-1.1.9-2 2-2h4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 4l8 8-6 6-8-8z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 6l8 8"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                          <span>{designCoins}</span>
                        </button>
                        {isProfileEditing && (
                          <button
                            type="button"
                            className="primary"
                            onClick={() => {
                              setIsProfileEditing(false);
                              setProfilePasswordDraft({ password: "", confirm: "" });
                            }}
                          >
                            저장
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="profile-fields profile-fields-compact">
                      <label className="field">
                        비밀번호
                        <input
                          type="password"
                          value={
                            isProfileEditing
                              ? profilePasswordDraft.password
                              : "••••••••"
                          }
                          disabled={!isProfileEditing}
                          onChange={(event) =>
                            setProfilePasswordDraft((prev) => ({
                              ...prev,
                              password: event.target.value,
                            }))
                          }
                          placeholder="비밀번호 변경"
                        />
                      </label>
                      {isProfileEditing && (
                        <label className="field">
                          비밀번호 변경 확인
                          <input
                            type="password"
                            value={profilePasswordDraft.confirm}
                            onChange={(event) =>
                              setProfilePasswordDraft((prev) => ({
                                ...prev,
                                confirm: event.target.value,
                              }))
                            }
                            placeholder="비밀번호 확인"
                          />
                        </label>
                      )}
                      <label className="field">
                        선호스타일
                        <input
                          value={userProfile.styleTags.join(", ")}
                          disabled={!isProfileEditing}
                          onChange={(event) =>
                            updateProfileField(
                              "styleTags",
                              event.target.value
                                .split(",")
                                .map((item) => item.trim())
                                .filter(Boolean),
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <h4>정밀 신체 수치 데이터</h4>
                <div className="measurement-grid">
                  {[
                    { label: "키", key: "height" },
                    { label: "몸무게", key: "weight" },
                    { label: "목둘레", key: "neckCircum" },
                    { label: "어깨너비", key: "shoulderWidth" },
                    { label: "가슴둘레", key: "chestCircum" },
                    { label: "허리둘레", key: "waistCircum" },
                    { label: "엉덩이둘레", key: "hipCircum" },
                    { label: "팔길이", key: "armLength" },
                    { label: "다리길이", key: "legLength" },
                    { label: "발사이즈", key: "shoeSize" },
                  ].map((field) => (
                    <label key={field.key} className="field">
                      {field.label}
                      <input
                        type="number"
                        value={userProfile.measurements[field.key]}
                        disabled={!isProfileEditing}
                        onChange={(event) =>
                          updateMeasurement(field.key, event.target.value)
                        }
                      />
                    </label>
                  ))}
                </div>
                <div className="meta">
                  <span>Updated: {userProfile.updatedAt}</span>
                </div>
                <div className="profile-account-bar">
                  <button
                    type="button"
                    className="ghost"
                    disabled={isProfileEditing}
                    onClick={() => setIsProfileEditing(true)}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setAccountDeleteConfirmOpen(true)}
                  >
                    탈퇴
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      {authModal.open && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={closeAuthModal}
            >
              ×
            </button>
            <h3>
              {authModal.mode === "logout-confirm"
                ? "로그아웃하시겠어요?"
                : "로그인이 필요합니다"}
            </h3>
            {authModal.mode === "logout-confirm" && (
              <p>로그아웃 시 일부 기능 이용이 제한됩니다.</p>
            )}
            {authModal.mode === "login-required" && (
              <p>로그인 후 이용할 수 있는 기능입니다.</p>
            )}
            <div className="auth-modal-actions">
              {authModal.mode === "logout-confirm" && (
                <button
                  type="button"
                  className="secondary"
                  onClick={closeAuthModal}
                >
                  취소
                </button>
              )}
              {authModal.mode === "login-required" && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    closeAuthModal();
                    startOnboarding();
                  }}
                >
                  회원가입
                </button>
              )}
              <button
                type="button"
                className="primary"
                onClick={() => {
                  if (authModal.mode === "logout-confirm") {
                    handleLogout();
                    closeAuthModal();
                    return;
                  }
                  closeAuthModal();
                  openLoginFlow();
                }}
              >
                {authModal.mode === "logout-confirm" ? "로그아웃" : "로그인"}
              </button>
            </div>
          </div>
        </div>
      )}
      {loginModalOpen && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={closeLoginModal}
            >
              ×
            </button>
            <h3>로그인</h3>
            <div className="auth-modal-form">
              <label>
                이메일
                <input
                  value={loginDraft.handle}
                  onChange={(event) =>
                    setLoginDraft((prev) => ({
                      ...prev,
                      handle: event.target.value,
                    }))
                  }
                  placeholder="name@example.com"
                />
              </label>
              <label>
                비밀번호
                <input
                  type="password"
                  value={loginDraft.password}
                  onChange={(event) =>
                    setLoginDraft((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  placeholder="비밀번호 입력"
                />
              </label>
            </div>
            <div className="auth-modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={startOnboarding}
              >
                회원가입
              </button>
              <button type="button" className="primary" onClick={submitLogin}>
                로그인
              </button>
            </div>
          </div>
        </div>
      )}
      {isGalleryOpen && (
        <div
          className="studio-gallery-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsGalleryOpen(false)}
        >
          <div
            className={`studio-gallery-content ${generatedDesigns.length + tempDesigns.length <= 2 ? "compact" : ""
              }`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={() => setIsGalleryOpen(false)}
            >
              ×
            </button>
            <div className="studio-gallery-header">
              <h3>Generated Gallery</h3>
              <span className="studio-gallery-count">
                현재 디자인 수: {generatedDesigns.length + tempDesigns.length} /
                10
              </span>
            </div>
            <div className="gallery-grid">
              {generatedDesigns.length + tempDesigns.length === 0 && (
                <p className="empty">아직 생성된 디자인이 없습니다.</p>
              )}
              {[...tempDesigns, ...generatedDesigns]
                .slice(0, 10)
                .map((item, index) => (
                  <div
                    key={item.id}
                    className="gallery-card"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <button
                      type="button"
                      className="album-remove"
                      aria-label="Remove design"
                      onClick={() => removeDesign(item.id, item.isTemp)}
                    >
                      ×
                    </button>
                    <img src={item.design_img_url} alt={item.name} />
                    <div className="album-meta">
                      <div className="album-meta-row">
                        <strong>{item.name}</strong>
                        <button
                          type="button"
                          className="album-load-btn"
                          onClick={() => {
                            setStudioSideImages((prev) => ({
                              ...prev,
                              [studioSide]: item.design_img_url,
                            }));
                            loadDesignToCanvas(item.design_img_url);
                            setIsGalleryOpen(false);
                          }}
                        >
                          불러오기
                        </button>
                      </div>
                      <span>{item.savedAt}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      {brandFundingOpen && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content brand-funding-modal">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={() => setBrandFundingOpen(false)}
            >
              ×
            </button>
            <h3>펀딩 현황</h3>
            <div className="brand-list">
              {brands.map((item) => (
                <div key={item.id} className="brand-card">
                  <div>
                    <strong>{item.brand}</strong>
                    <p>
                      참여 {item.participantCount}명 · ₩
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
            <div className="auth-modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setBrandFundingOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      {cancelFundingModal.open && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={closeCancelFundingModal}
            >
              ×
            </button>
            <h3>펀딩을 취소할까요?</h3>
            <p>취소 시 이 작업은 되돌릴 수 없습니다.</p>
            <div className="auth-modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={closeCancelFundingModal}
              >
                돌아가기
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  setInvestments((prev) =>
                    prev.filter(
                      (entry) => entry.id !== cancelFundingModal.investmentId,
                    ),
                  );
                  setFundingCancelAlertOpen(true);
                  closeCancelFundingModal();
                }}
              >
                펀딩 취소
              </button>
            </div>
          </div>
        </div>
      )}
      {aiDesignModal.open && aiDesignModal.design && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content ai-design-modal">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={() => {
                setAiDesignModal({ open: false, design: null });
                setAiDesignEditMode(false);
              }}
            >
              ×
            </button>
            <div className="ai-design-header">
              <h3>AI Design</h3>
              <div className="ai-design-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={handleAiDesignEditToggle}
                >
                  {aiDesignEditMode ? "저장" : "수정"}
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleAiDesignUpload}
                >
                  업로드
                </button>
              </div>
            </div>
            <div className="ai-design-preview-container">
              <div className="modal-stack ai-design-stack">
                <div className="modal-header">
                  <div>
                    <h2>{brand.name}</h2>
                    {aiDesignEditMode ? (
                      <input
                        className="ai-design-input"
                        value={aiDesignDraft.name}
                        onChange={(event) =>
                          setAiDesignDraft((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        aria-label="Design name"
                      />
                    ) : (
                      <p>{aiDesignModal.design.name}</p>
                    )}
                  </div>
                  <div className="pill-group">
                    {["overview", "story", "feedback"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={`pill ${detailTab === tab ? "active" : ""}`}
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
                    <div className="image-placeholder" aria-label="Image area">
                      이미지 영역
                    </div>
                  </div>
                  <div
                    className={`detail-scroll ${detailTab === "feedback" ? "detail-scroll-feedback" : ""
                      }`}
                  >
                    {detailTab === "overview" && (
                      <div className="detail-block">
                        <div className="price-row">
                          <div className="price-main">
                            <span className="price-label">Price</span>
                            {aiDesignEditMode ? (
                              <input
                                className="ai-design-input price"
                                type="number"
                                min="0"
                                value={aiDesignDraft.price}
                                onChange={(event) =>
                                  setAiDesignDraft((prev) => ({
                                    ...prev,
                                    price: event.target.value,
                                  }))
                                }
                                aria-label="Design price"
                              />
                            ) : (
                              <strong className="price-strong">
                                {currency.format(
                                  aiDesignModal.design.price || 0,
                                )}
                              </strong>
                            )}
                          </div>
                        </div>
                        <h4>옷 세부내용</h4>
                        {aiDesignEditMode ? (
                          <textarea
                            className="ai-design-textarea"
                            value={aiDesignDraft.description}
                            onChange={(event) =>
                              setAiDesignDraft((prev) => ({
                                ...prev,
                                description: event.target.value,
                              }))
                            }
                          />
                        ) : (
                          <p>
                            {aiDesignModal.design.description ||
                              "AI가 생성한 컨셉을 기반으로 실루엣과 소재 밸런스를 설계했습니다."}
                          </p>
                        )}
                        <div className="detail-tags">
                          <span className="detail-tag">#니트</span>
                          <span className="detail-tag">#미니멀</span>
                          <span className="detail-tag">#여성</span>
                        </div>
                        <div className="spec-grid">
                          <div>
                            <span>카테고리</span>
                            {aiDesignEditMode ? (
                              <input
                                className="ai-design-input"
                                value={aiDesignDraft.category}
                                onChange={(event) =>
                                  setAiDesignDraft((prev) => ({
                                    ...prev,
                                    category: event.target.value,
                                  }))
                                }
                                aria-label="Design category"
                              />
                            ) : (
                              <strong>{aiDesignModal.design.category}</strong>
                            )}
                          </div>
                          <div>
                            <span>스타일</span>
                            {aiDesignEditMode ? (
                              <input
                                className="ai-design-input"
                                value={aiDesignDraft.style}
                                onChange={(event) =>
                                  setAiDesignDraft((prev) => ({
                                    ...prev,
                                    style: event.target.value,
                                  }))
                                }
                                aria-label="Design style"
                              />
                            ) : (
                              <strong>{aiDesignModal.design.style}</strong>
                            )}
                          </div>
                          <div>
                            <span>성별</span>
                            {aiDesignEditMode ? (
                              <input
                                className="ai-design-input"
                                value={aiDesignDraft.gender}
                                onChange={(event) =>
                                  setAiDesignDraft((prev) => ({
                                    ...prev,
                                    gender: event.target.value,
                                  }))
                                }
                                aria-label="Design gender"
                              />
                            ) : (
                              <strong>{aiDesignModal.design.gender}</strong>
                            )}
                          </div>
                          <div>
                            <span>사이즈</span>
                            <strong>XS - XL</strong>
                          </div>
                        </div>
                        <div className="spec-bar">
                          {[
                            { label: "신축성", value: 5 },
                            { label: "두께감", value: 5 },
                            { label: "탄탄함", value: 5 },
                          ].map((item) => (
                            <div className="spec-bar-row" key={item.label}>
                              <span>{item.label}</span>
                              <div className="spec-track">
                                <div
                                  className="spec-fill"
                                  style={{
                                    width: `${(item.value / 10) * 100}%`,
                                  }}
                                />
                              </div>
                              <strong>{item.value}/10</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {detailTab === "story" && (
                      <div className="detail-block">
                        <h4>브랜드 스토리</h4>
                        {aiDesignEditMode ? (
                          <textarea
                            className="ai-design-textarea"
                            value={aiDesignDraft.story}
                            onChange={(event) =>
                              setAiDesignDraft((prev) => ({
                                ...prev,
                                story: event.target.value,
                              }))
                            }
                          />
                        ) : (
                          <p>
                            {aiDesignModal.design.story ||
                              "AI가 트렌드 데이터를 분석해 감각적인 컬렉션 스토리를 구성했습니다. 디자이너가 세부 디테일을 다듬을 수 있도록 여지를 남겨두었습니다."}
                          </p>
                        )}
                      </div>
                    )}
                    {detailTab === "feedback" && (
                      <div className="detail-block">
                        <h4>소셜 피드백</h4>
                        <p className="comment-empty">
                          아직 생성된 피드백이 없습니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {nameModal.open && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={() =>
                setNameModal({ open: false, type: null, value: "", view: null })
              }
            >
              ×
            </button>
            <h3>이름을 입력하세요</h3>
            <div className="auth-modal-form">
              <label className="field">
                이름
                <input
                  value={nameModal.value}
                  onChange={(event) =>
                    setNameModal((prev) => ({
                      ...prev,
                      value: event.target.value,
                    }))
                  }
                  placeholder="이름을 입력하세요"
                />
              </label>
            </div>
            <div className="auth-modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setNameModal({
                    open: false,
                    type: null,
                    value: "",
                    view: null,
                  })
                }
              >
                취소
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  const trimmed = nameModal.value.trim();
                  if (nameModal.type === "temp-design") {
                    saveTempDesign(trimmed);
                  }
                  if (nameModal.type === "fitting") {
                    saveFittingSnapshot(trimmed, nameModal.view);
                  }
                  setNameModal({
                    open: false,
                    type: null,
                    value: "",
                    view: null,
                  });
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
      {brandPageRequiredOpen && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={() => setBrandPageRequiredOpen(false)}
            >
              ×
            </button>
            <h3>브랜드 페이지가 필요합니다</h3>
            <p>디자인을 업로드하려면 먼저 브랜드 페이지를 만들어야 합니다.</p>
            <div className="auth-modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setBrandPageRequiredOpen(false)}
              >
                나중에
              </button>
              <button type="button" className="primary" onClick={createBrandPage}>
                브랜드 페이지 만들기
              </button>
            </div>
          </div>
        </div>
      )}
      {brandCreatePromptOpen && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={() => setBrandCreatePromptOpen(false)}
            >
              ×
            </button>
            <h3>브랜드를 생성하시겠습니까?</h3>
            <p>브랜드 페이지를 만든 뒤 바로 포트폴리오를 시작할 수 있습니다.</p>
            <div className="auth-modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setBrandCreatePromptOpen(false)}
              >
                취소
              </button>
              <button type="button" className="primary" onClick={createBrandPage}>
                계속
              </button>
            </div>
          </div>
        </div>
      )}
      {brandDeleteConfirmOpen && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={() => setBrandDeleteConfirmOpen(false)}
            >
              ×
            </button>
            <h3>브랜드 페이지를 삭제할까요?</h3>
            <p>삭제하면 브랜드 정보와 팔로우 상태가 모두 초기화됩니다.</p>
            <div className="auth-modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setBrandDeleteConfirmOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleDeleteBrandPage}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
      {accountDeleteConfirmOpen && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={() => setAccountDeleteConfirmOpen(false)}
            >
              ×
            </button>
            <h3>정말 탈퇴하시겠어요?</h3>
            <p>탈퇴하면 계정 정보가 모두 삭제됩니다.</p>
            <div className="auth-modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setAccountDeleteConfirmOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleAccountDelete}
              >
                탈퇴
              </button>
            </div>
          </div>
        </div>
      )}
      {designCoinModal && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content design-coin-modal">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={() => setDesignCoinModal(false)}
            >
              ×
            </button>
            <h3>디자인 토큰 구매</h3>
            <p>디자인 생성에 필요한 토큰을 충전하세요.</p>
            <div className="design-coin-balance">
              보유 토큰 <strong>{designCoins}</strong>
            </div>
            <div className="design-coin-grid">
              {designCoinPackages.map((pack) => (
                <div key={pack.id} className="design-coin-card">
                  <div>
                    <strong>{pack.label}</strong>
                    <span>{pack.amount} 토큰</span>
                  </div>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setDesignCoins((prev) => prev + pack.amount);
                      setDesignCoinAlertOpen(true);
                      setDesignCoinAlertClosing(false);
                    }}
                  >
                    {currency.format(pack.price)} 구입
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {designCoinAlertOpen && (
        <div
          className={`toast-banner ${designCoinAlertClosing ? "is-leaving" : ""
            }`}
          role="status"
        >
          <div className="toast-content">
            <strong>토큰이 구매되었습니다.</strong>
            <span>디자인 토큰이 충전되었습니다.</span>
          </div>
          <div className="toast-actions">
            <button
              type="button"
              className="primary"
              onClick={closeDesignCoinAlert}
            >
              확인
            </button>
          </div>
        </div>
      )}
      {designGenerateConfirmOpen && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content design-generate-modal">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={() => setDesignGenerateConfirmOpen(false)}
            >
              ×
            </button>
            <div className="design-generate-top">
              <h3>디자인 토큰이 소모됩니다.</h3>
              <button
                type="button"
                className="design-coin"
                aria-label="Design token balance"
                onClick={() => setDesignCoinModal(true)}
              >
                <span className="design-coin-icon" aria-hidden="true">
                  <svg
                    className="design-coin-brush"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 20c2.2 0 4-1.8 4-4 0-1.1.9-2 2-2h4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 4l8 8-6 6-8-8z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 6l8 8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="design-coin-count">{designCoins}</span>
              </button>
            </div>
            <p>확인하면 AI 디자인 생성 페이지로 이동합니다.</p>
            <div className="auth-modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setDesignGenerateConfirmOpen(false)}
              >
                돌아가기
              </button>
              <button
                type="button"
                className="primary"
                onClick={confirmGenerateDesign}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      {fundingConfirmOpen && (
        <div className="auth-modal" role="dialog" aria-modal="true">
          <div className="auth-modal-content funding-confirm-modal">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={() => setFundingConfirmOpen(false)}
            >
              ×
            </button>
            <h3>펀딩을 신청할까요?</h3>
            <p>신청 후에는 포트폴리오에서 관리할 수 있습니다.</p>
            <div className="auth-modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setFundingConfirmOpen(false)}
              >
                돌아가기
              </button>
              <button
                type="button"
                className="primary"
                onClick={finalizeFundNow}
              >
                펀딩 신청
              </button>
            </div>
          </div>
        </div>
      )}
      {alreadyFundedAlertOpen && (
        <div
          className={`toast-banner ${alreadyFundedClosing ? "is-leaving" : ""}`}
          role="status"
        >
          <div className="toast-content">
            <strong>이미 펀딩한 옷입니다.</strong>
            <span>해당 아이템은 포트폴리오에 있습니다.</span>
          </div>
          <div className="toast-actions">
            <button
              type="button"
              className="primary"
              onClick={closeAlreadyFundedAlert}
            >
              확인
            </button>
          </div>
        </div>
      )}
      {fundingAlertOpen && (
        <div
          className={`toast-banner ${fundingAlertClosing ? "is-leaving" : ""}`}
          role="status"
        >
          <div className="toast-content">
            <strong>펀딩이 신청되었습니다.</strong>
            <span>포트폴리오에서 진행 상황을 확인하세요.</span>
          </div>
          <div className="toast-actions">
            <button
              type="button"
              className="primary"
              onClick={closeFundingAlert}
            >
              확인
            </button>
          </div>
        </div>
      )}
      {fundingCancelAlertOpen && (
        <div
          className={`toast-banner ${fundingCancelClosing ? "is-leaving" : ""}`}
          role="status"
        >
          <div className="toast-content">
            <strong>펀딩이 취소되었습니다.</strong>
            <span>해당 항목이 포트폴리오에서 삭제되었습니다.</span>
          </div>
          <div className="toast-actions">
            <button
              type="button"
              className="primary"
              onClick={closeFundingCancelAlert}
            >
              확인
            </button>
          </div>
        </div>
      )}
      {limitAlertOpen && (
        <div className="toast-banner" role="status">
          <div className="toast-content">
            <strong>최대 저장 수를 초과했습니다.</strong>
            <span>{limitAlertMessage}</span>
          </div>
          <div className="toast-actions">
            <button
              type="button"
              className="primary"
              onClick={() => setLimitAlertOpen(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={appContent} />
      <Route path="/fitting" element={<MyFitting />} />
      <Route path="/*" element={appContent} />
    </Routes>
  );
}

export default App;

