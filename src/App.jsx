import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  initialClothing,
  initialFunding,
  initialComments,
  mannequins,
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
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedBrandKey, setSelectedBrandKey] = useState(null);
  const [followedBrands, setFollowedBrands] = useState([]);
  const [brandProfiles, setBrandProfiles] = useState(initialBrandProfiles);
  const [fittingAlbumOpen, setFittingAlbumOpen] = useState(false);
  const [portfolioTab, setPortfolioTab] = useState("investee");
  const [investments, setInvestments] = useState(initialInvestments);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [brandEditing, setBrandEditing] = useState(false);
  const [portfolioListOpen, setPortfolioListOpen] = useState(null);
  const [myBrandDetails, setMyBrandDetails] = useState({
    brand: brand.name.toUpperCase(),
    handle: "@motif.studio",
    bio: "브랜드 소개를 추가해보세요.",
    location: "Seoul",
    logoUrl: "/logo.png",
  });
  const [introOpen, setIntroOpen] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [measurementMode, setMeasurementMode] = useState("manual");
  const [signupDraft, setSignupDraft] = useState(() => ({
    handle: userBase.handle,
    name: userBase.name,
    base_photo_url: userBase.base_photo_url,
    measurements: { ...userBase.measurements },
  }));
  const [selectedStyleIds, setSelectedStyleIds] = useState([]);
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

  const brandProfileMap = useMemo(() => {
    return brandProfiles.reduce((map, profile) => {
      map[profile.brand.toLowerCase()] = profile;
      map[profile.handle.toLowerCase()] = profile;
      return map;
    }, {});
  }, [brandProfiles]);

  const followerSeries = useMemo(
    () => [
      { date: "2024-01", value: 42 },
      { date: "2024-02", value: 58 },
      { date: "2024-03", value: 67 },
      { date: "2024-04", value: 84 },
      { date: "2024-05", value: 96 },
      { date: "2024-06", value: 112 },
      { date: "2024-07", value: 138 },
      { date: "2024-08", value: 165 },
      { date: "2024-09", value: 192 },
      { date: "2024-10", value: 214 },
    ],
    []
  );
  const followerValues = useMemo(
    () => followerSeries.map((item) => item.value),
    [followerSeries]
  );
  const followerChartWidth = useMemo(
    () => Math.max(360, (followerSeries.length - 1) * 90),
    [followerSeries.length]
  );
  const followerChartStep = useMemo(
    () => followerChartWidth / Math.max(1, followerSeries.length - 1),
    [followerChartWidth, followerSeries.length]
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

  const currentFollowerCount =
    followerSeries[followerSeries.length - 1]?.value || 0;
  const followingCount = followedBrands.length;

  const selectedBrandProfile = useMemo(() => {
    if (!selectedBrandKey) return null;
    if (
      selectedBrandKey === myBrandDetails.handle ||
      selectedBrandKey === myBrandDetails.brand
    ) {
      return {
        id: "my-brand",
        brand: myBrandDetails.brand,
        handle: myBrandDetails.handle,
        followerCount: currentFollowerCount,
        followingCount,
        bio: myBrandDetails.bio,
        location: myBrandDetails.location,
      };
    }
    return (
      brandProfiles.find(
        (profile) =>
          profile.handle === selectedBrandKey ||
          profile.brand === selectedBrandKey
      ) || null
    );
  }, [
    brandProfiles,
    currentFollowerCount,
    followingCount,
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
    []
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
    []
  );
  const mainCategoryLabels = useMemo(
    () => ({
      All: "전체",
      Tops: "상의",
      Outer: "아우터",
      Bottoms: "하의",
      Dress: "원피스",
    }),
    []
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
    []
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

  const updateProfileField = (key, value) => {
    setUserProfile((prev) => ({
      ...prev,
      [key]: value,
      updatedAt: formatDate(new Date()),
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

  const myBrandProfile = useMemo(
    () => ({
      id: "my-brand",
      brand: myBrandDetails.brand,
      handle: myBrandDetails.handle,
      followerCount: currentFollowerCount,
      followingCount,
      bio: myBrandDetails.bio,
      location: myBrandDetails.location,
    }),
    [currentFollowerCount, followingCount, myBrandDetails]
  );

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
    []
  );

  const followingProfiles = useMemo(
    () =>
      brandProfiles.filter((profile) =>
        followedBrands.includes(profile.handle)
      ),
    [brandProfiles, followedBrands]
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
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111111";
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const draw = (moveEvent) => {
      const x = moveEvent.clientX - rect.left;
      const y = moveEvent.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stop = () => {
      window.removeEventListener("mousemove", draw);
      window.removeEventListener("mouseup", stop);
    };

    window.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", stop);
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
      base_photo_url: userProfile.base_photo_url,
      measurements: { ...userProfile.measurements },
    });
    setSelectedStyleIds([]);
    setGoogleConnected(false);
    setOnboardingStep(0);
    setMeasurementMode("manual");
  };

  const startOnboarding = () => {
    setIntroOpen(false);
    resetOnboarding();
    setOnboardingOpen(true);
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
      const url = URL.createObjectURL(file);
      updateSignupField("base_photo_url", url);
    }
  };

  const toggleStyleSelection = (clothingId) => {
    setSelectedStyleIds((prev) =>
      prev.includes(clothingId)
        ? prev.filter((id) => id !== clothingId)
        : [...prev, clothingId]
    );
  };

  const finalizeOnboarding = () => {
    const nextStyleTags = Array.from(
      new Set(
        selectedStyleIds
          .map((id) => clothingMap[id]?.style)
          .filter(Boolean)
      )
    );
    setUserProfile((prev) => ({
      ...prev,
      handle: signupDraft.handle,
      name: signupDraft.name,
      base_photo_url: signupDraft.base_photo_url,
      measurements: { ...prev.measurements, ...signupDraft.measurements },
      styleTags: nextStyleTags.length ? nextStyleTags : prev.styleTags,
      updatedAt: formatDate(new Date()),
    }));
    setFundings((prev) =>
      prev.map((item) => {
        if (!selectedStyleIds.includes(item.clothing_id)) return item;
        if (item.liked) return item;
        return { ...item, liked: true, likes: item.likes + 1 };
      })
    );
    setOnboardingOpen(false);
    setActiveTab("discover");
  };

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.body.classList.toggle("intro-open", introOpen);
    return () => {
      document.body.classList.remove("intro-open");
    };
  }, [introOpen]);

  useEffect(() => {
    if (!introOpen) return;
    const sections = document.querySelectorAll(".intro-section, .intro-actions");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.55 }
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
    const key = profile.handle || profile.brand;
    setSelectedBrandKey(key);
    setActiveTab("brand");
    setDetailItem(null);
    setSearchOpen(false);
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
        (item) => item.handle === notice.target.handle
      );
      if (profile) {
        openBrandProfile(profile);
      }
    }
  };

  const toggleFollowBrand = (handle) => {
    if (!handle) return;
    setFollowedBrands((prev) => {
      const isFollowed = prev.includes(handle);
      setBrandProfiles((current) =>
        current.map((profile) =>
          profile.handle === handle
            ? {
                ...profile,
                followerCount: Math.max(
                  0,
                  profile.followerCount + (isFollowed ? -1 : 1)
                ),
              }
            : profile
        )
      );
      return isFollowed
        ? prev.filter((item) => item !== handle)
        : [...prev, handle];
    });
  };

  const requiredStyleCount = 3;
  const canProceedProfile =
    signupDraft.handle.trim().length > 0 && signupDraft.name.trim().length > 0;
  const canFinishOnboarding =
    googleConnected &&
    canProceedProfile &&
    selectedStyleIds.length >= requiredStyleCount;

  if (onboardingOpen) {
    return (
      <div className="onboarding-page">
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
                Step {onboardingStep + 1} / 3
              </span>
              <h2>당신의 스타일 여정을 시작해요.</h2>
              <p>순서대로 입력하고 다음으로 넘어가세요.</p>
            </div>
          </header>

          <div className="onboarding-body">
            {onboardingStep === 0 && (
              <section className="onboarding-section is-visible">
                <div className="onboarding-section-inner compact">
                  <div className="onboarding-panel google-card">
                    <h3>Google 로그인</h3>
                    <p>
                      계정을 연결하면 저장된 취향과 추천이 즉시 동기화됩니다.
                    </p>
                    <div className="google-row">
                      <button
                        type="button"
                        className="primary"
                        onClick={() => {
                          setGoogleConnected(true);
                          setOnboardingStep(1);
                        }}
                      >
                        Google로 계속
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {onboardingStep === 1 && (
              <section className="onboarding-section is-visible">
                <div className="onboarding-section-inner">
                  <span className="onboarding-step">Step 2</span>
                  <div className="onboarding-panel">
                    <h3>기본 정보</h3>
                    <div className="onboarding-grid">
                      <div className="profile-photo-upload">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePhotoChange}
                        />
                        <div className="profile-icon">
                          {signupDraft.base_photo_url ? (
                            <img src={signupDraft.base_photo_url} alt="Profile" />
                          ) : (
                            <div className="avatar-placeholder">👤</div>
                          )}
                        </div>
                      </div>
                      <div className="name-fields">
                        <label className="onboarding-field">
                          아이디
                          <input
                            value={signupDraft.handle}
                            onChange={(event) =>
                              updateSignupField("handle", event.target.value)
                            }
                            placeholder="@your.id"
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
                      </div>
                    </div>
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
                                정면 전신 사진 1장을 업로드하면 AI가 자동으로
                                치수를 계산합니다.
                              </span>
                            </div>
                            <label className="ai-upload-btn">
                              사진
                              <input type="file" accept="image/*" />
                            </label>
                          </div>
                          <div className="ai-hint">
                            밝은 배경에서 정면 자세로 촬영된 이미지를 권장합니다.
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
                                    event.target.value
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
                        onClick={() => setOnboardingStep(2)}
                      >
                        다음
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {onboardingStep === 2 && (
              <section className="onboarding-section is-visible">
                <div className="onboarding-section-inner">
                  <span className="onboarding-step">Step 3</span>
                  <div className="onboarding-panel">
                    <div className="style-pick-header">
                      <h4>취향에 맞는 아이템을 골라주세요.</h4>
                      <span>
                        선택 {selectedStyleIds.length}/{requiredStyleCount}
                      </span>
                    </div>
                    <div className="style-pick-grid">
                      {onboardingStyleItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`style-pick-card ${
                            selectedStyleIds.includes(item.id)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => toggleStyleSelection(item.id)}
                        >
                          <img src={item.design_img_url} alt={item.name} />
                          <div className="style-pick-meta">
                            <strong>{item.name}</strong>
                            <span>
                              {item.style} · {item.category}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {!canFinishOnboarding && (
                      <p className="onboarding-hint">
                        최소 {requiredStyleCount}개를 선택하면 가입이
                        완료됩니다.
                      </p>
                    )}
                    <div className="onboarding-submit">
                      <button
                        type="button"
                        className="primary"
                        disabled={!canFinishOnboarding}
                        onClick={finalizeOnboarding}
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

  return (
    <div
      className={`app ${sidebarOpen ? "" : "sidebar-collapsed"} ${
        darkMode ? "dark" : ""
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
              <span className="intro-title-sub">Modify Your Mode</span>
            </div>
          </section>
          <section className="intro-content">
            <div className="intro-body intro-animate">
              <div className="intro-sections">
                <article className="intro-section" style={{ "--delay": "0ms" }}>
                  <span className="intro-keyword">Create</span>
                  <h3 className="intro-heading">상상, 현실의 패턴이 되다.</h3>
                  <p className="intro-desc">
                    AI 스튜디오에서 단 한 줄의 텍스트로
                    <br />
                    당신의 상상을 구체적인 실루엣으로 그려냅니다.
                  </p>
                </article>
                <article className="intro-section" style={{ "--delay": "180ms" }}>
                  <span className="intro-keyword">Invest</span>
                  <h3 className="intro-heading">당신의 안목, 자산이 되다.</h3>
                  <p className="intro-desc">
                    전 세계 창작자들의 가치를 가장 먼저 발견하고,
                    <br />
                    미래의 유니콘 브랜드에 투자하세요.
                  </p>
                </article>
                <article className="intro-section" style={{ "--delay": "360ms" }}>
                  <span className="intro-keyword">Fit</span>
                  <h3 className="intro-heading">입지 않아도, 완벽하게.</h3>
                  <p className="intro-desc">
                    내 체형 데이터로 경험하는 0.1mm의 디테일.
                    <br />
                    가상 피팅의 새로운 기준입니다.
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
              onClick={() => setActiveTab(item.key)}
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
              <div className="tag-line">
                {selectedMainCategory === "All" ? (
                  <div className="tag-group">
                    {mainCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={`tag ${
                          selectedMainCategory === category ? "active" : ""
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
                          className={`tag ${
                            selectedSubCategory === category ? "active" : ""
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
                      <div className="detail-scroll">
                        {detailTab === "overview" && (
                          <div className="detail-block">
                            <div className="price-row">
                              <div className="price-main">
                                <span className="price-label">Price</span>
                                <strong className="price-strong">
                                  {currency.format(
                                    detailItem.clothing?.price || 0
                                  )}
                                </strong>
                              </div>
                              <div className="price-like-row">
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
                            </div>
                            <h4>옷 세부내용</h4>
                            <p>
                              {detailItem.clothing?.name}은(는) 절제된 실루엣과
                              깔끔한 마감으로 일상과 포멀 모두에 어울립니다.
                            </p>
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
                                { label: "무게감", value: fabric.weight },
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
                              {detailItem.funding.brand}는 장인 정신과 데이터
                              기반 디자인을 결합해 지속 가능한 컬렉션을
                              선보입니다. 이번 라인업은 도시적인 실루엣과 실용적
                              디테일을 강조하며, 고객 피드백을 빠르게 반영하는
                              것을 목표로 합니다.
                            </p>
                            <div className="story-meta">
                              <div className="story-row">
                                <span>목표/현재</span>
                                <strong>
                                  목표{" "}
                                  {currency.format(
                                    detailItem.funding.goal_amount
                                  )}{" "}
                                  · 현재{" "}
                                  {currency.format(
                                    detailItem.funding.current_amount
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
                                      <div className="comment-rating">
                                        {Array.from({ length: 5 }).map(
                                          (_, index) => (
                                            <span
                                              key={index}
                                              className={`star-icon ${
                                                index < comment.rating
                                                  ? "active"
                                                  : ""
                                              }`}
                                            >
                                              ★
                                            </span>
                                          )
                                        )}
                                      </div>
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
                                <div className="comment-rating-input">
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      className={`star-btn ${
                                        index < commentDraft.rating
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
                  <h4>디자인 모드</h4>
                  <div className="design-panel">
                    <div className="design-tabs">
                      {["상의", "하의", "아우터", "원피스"].map((category) => (
                        <button
                          key={category}
                          type="button"
                          className={`pill ${
                            designCategory === category ? "active" : ""
                          }`}
                          onClick={() => setDesignCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="design-canvas-wrap">
                      <canvas
                        className="design-canvas"
                        width="520"
                        height="380"
                        onMouseDown={handleCanvasDraw}
                        aria-label="Design canvas"
                      />
                      <p className="design-hint">
                        {designCategory} 실루엣을 드로잉하세요.
                      </p>
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
            <div className="page-title page-title-row">
              <div>
                <h1>My Fitting</h1>
                <p>
                  나만의 가상 드레스룸 - 레이어링과 AI 매칭을 동시에 확인합니다.
                </p>
              </div>
              <div className="page-title-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setFittingAlbumOpen(true)}
                >
                  Fitting Album
                </button>
              </div>
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
            {fittingAlbumOpen && (
              <div className="modal" role="dialog" aria-modal="true">
                <div className="modal-content album-modal-content">
                  <button
                    className="close"
                    type="button"
                    onClick={() => setFittingAlbumOpen(false)}
                  >
                    ×
                  </button>
                  <div className="album-modal-header">
                    <h3>Fitting Album</h3>
                    <span>{initialFittingHistory.length} items</span>
                  </div>
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
            )}
          </section>
        )}

        {activeTab === "portfolio" && (
          <section className="content">
            <div className="portfolio-head">
              <div className="page-title">
                <h1>Portfolio</h1>
                <p>나의 패션 자산 대시보드 - 투자와 창작 기록을 관리합니다.</p>
              </div>
              <div className="portfolio-tabs">
                <button
                  type="button"
                  className={`pill ${
                    portfolioTab === "investee" ? "active" : ""
                  }`}
                  onClick={() => setPortfolioTab("investee")}
                >
                  Investee
                </button>
                <button
                  type="button"
                  className={`pill ${
                    portfolioTab === "investor" ? "active" : ""
                  }`}
                  onClick={() => setPortfolioTab("investor")}
                >
                  Investor
                </button>
              </div>
            </div>

            {portfolioTab === "investee" && (
              <div className="portfolio-grid">
                <div className="panel">
                  <h3>My Brands</h3>
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
                            />
                          </svg>
                          <div className="follow-chart-x">
                            {followerSeries.map((item, index) => (
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
                  <div className="follow-actions">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => openBrandProfile(myBrandProfile)}
                    >
                      내 브랜드 페이지
                    </button>
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
                      investments.map((item) => (
                        <div key={item.id} className="investment-card">
                          <img src={item.image} alt={item.itemName} />
                          <div>
                            <strong>{item.brand}</strong>
                            <p>{item.itemName}</p>
                            <p>\{currency.format(item.amount)}</p>
                            <span className="status">{item.status}</span>
                            <span className="eta">예상 배송: {item.eta}</span>
                          </div>
                          <button
                            type="button"
                            className="ghost"
                            onClick={() =>
                              setInvestments((prev) =>
                                prev.filter((entry) => entry.id !== item.id)
                              )
                            }
                          >
                            펀딩 취소
                          </button>
                        </div>
                      ))
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
                            <button type="button" className="ghost">
                              팔로우
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
                <p>{selectedBrandProfile.handle}</p>
              </div>
              {selectedBrandProfile.handle === myBrandDetails.handle && (
                <button
                  type="button"
                  className="brand-edit-btn"
                  aria-label="Edit brand profile"
                  onClick={() => {
                    setBrandEditing((prev) => !prev);
                    if (brandEditing) {
                      setSelectedBrandKey(myBrandDetails.handle);
                    }
                  }}
                >
                  <Pencil size={16} strokeWidth={1.6} />
                </button>
              )}
            </div>

            <div className="brand-hero">
              <div className="brand-hero-card">
                <div className="brand-hero-info">
                  {brandEditing &&
                  selectedBrandProfile.handle === myBrandDetails.handle ? (
                    <>
                      <input
                        value={myBrandDetails.logoUrl}
                        onChange={(event) =>
                          setMyBrandDetails((prev) => ({
                            ...prev,
                            logoUrl: event.target.value,
                          }))
                        }
                        placeholder="로고 이미지 URL"
                      />
                      <input
                        value={myBrandDetails.brand}
                        onChange={(event) =>
                          setMyBrandDetails((prev) => ({
                            ...prev,
                            brand: event.target.value,
                          }))
                        }
                      />
                      <input
                        value={myBrandDetails.handle}
                        onChange={(event) =>
                          setMyBrandDetails((prev) => ({
                            ...prev,
                            handle: event.target.value,
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
                      <input
                        value={myBrandDetails.location}
                        onChange={(event) =>
                          setMyBrandDetails((prev) => ({
                            ...prev,
                            location: event.target.value,
                          }))
                        }
                        placeholder="지역"
                      />
                    </>
                  ) : (
                    <>
                      <img
                        className="brand-hero-logo"
                        src={myBrandDetails.logoUrl}
                        alt={`${selectedBrandProfile.brand} logo`}
                      />
                      <strong>{selectedBrandProfile.brand}</strong>
                      <span>{selectedBrandProfile.handle}</span>
                      <p>{selectedBrandProfile.bio}</p>
                      <small>{selectedBrandProfile.location}</small>
                    </>
                  )}
                </div>
                <div className="brand-hero-actions">
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
                </div>
              </div>

              <div className="brand-stats">
                <div>
                  <strong>{selectedBrandProfile.followerCount}</strong>
                  <span>Followers</span>
                </div>
                <div>
                  <strong>{selectedBrandProfile.followingCount}</strong>
                  <span>Following</span>
                </div>
                <div>
                  <strong>{brandFeed.length}</strong>
                  <span>Designs</span>
                </div>
              </div>
            </div>

            <div className="brand-feed">
              {brandFeed.length === 0 ? (
                <p className="empty">등록된 디자인이 없습니다.</p>
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
                <div className="profile-header">
                  <img
                    className="profile-photo"
                    src={userProfile.base_photo_url}
                    alt="profile"
                  />
                  <div>
                    <h3>{userProfile.name}</h3>
                    <span>{userProfile.handle}</span>
                  </div>
                  <div className="profile-actions">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setIsProfileEditing((prev) => !prev)}
                    >
                      {isProfileEditing ? "완료" : "수정"}
                    </button>
                  </div>
                </div>

                <div className="profile-fields">
                  <label className="field">
                    사용자 이름
                    <input
                      value={userProfile.name}
                      disabled={!isProfileEditing}
                      onChange={(event) =>
                        updateProfileField("name", event.target.value)
                      }
                    />
                  </label>
                  <label className="field">
                    사용자 id
                    <input
                      value={userProfile.handle}
                      disabled={!isProfileEditing}
                      onChange={(event) =>
                        updateProfileField("handle", event.target.value)
                      }
                    />
                  </label>
                  <label className="field">
                    피팅용 기본 전신 사진
                    <input
                      value={userProfile.base_photo_url}
                      disabled={!isProfileEditing}
                      onChange={(event) =>
                        updateProfileField("base_photo_url", event.target.value)
                      }
                    />
                  </label>
                  <label className="field">
                    체형 분류 라벨
                    <input
                      value={userProfile.bodyTypeLabel}
                      disabled={!isProfileEditing}
                      onChange={(event) =>
                        updateProfileField("bodyTypeLabel", event.target.value)
                      }
                    />
                  </label>
                  <label className="field full">
                    선호 스타일 태그 목록
                    <input
                      value={userProfile.styleTags.join(", ")}
                      disabled={!isProfileEditing}
                      onChange={(event) =>
                        updateProfileField(
                          "styleTags",
                          event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </label>
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
                  <button type="button" className="ghost">
                    구글 계정 변경
                  </button>
                  <button type="button" className="ghost">
                    로그아웃
                  </button>
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
