import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface BasicAdjustmentsState {
    brightness: number;
    contrast: number;
    saturation: number;
    gamma: number;
    convolute: number;
}

interface Aspect {
    width: number;
    height: number;
}

interface Transform {
    width: number;
    height: number;
    showAspects: boolean;
    selectedAspect: Aspect | null;
    rotatedAngle: number;
    flippedX: boolean;
    flippedY: boolean;
}

export interface TextPropertiesState {
    id: number;
    positionX: number;
    positionY: number;
    width: number;
    rotatedAngle: number;
    fontFamily: string;
    fontSize: number;
    fontColor: string;
    fontColorOpacity: number;
    backgroundColor: string;
    backgroundColorOpacity: number;
    lineSpacing: number;
    textAlign: "left" | "center" | "right";
    content: string;
}

interface BrushState {
    hardness: number;
    size: number;
    color: string;
    opacity: number;
}

interface updateString {
    id: number;
    value: string;
}

interface updateNumber {
    id: number;
    value: number;
}

interface updateAlign {
    id: number;
    value: "left" | "center" | "right";
}

interface updateContent {
    id: number;
    content: string;
}

interface updatePosition {
    id: number;
    positionX: number;
    positionY: number;
}

interface updateRotation {
    id: number;
    rotatedAngle: number;
}

interface updateWidth {
    id: number;
    width: number;
}

interface FilterState {
    selectedFilter: string;
    filterIntensity: number;
    availableFilters: {
        id: string;
        name: string;
        previewClass: string;
    }[];
}

interface OverlayState {
    selectedOverlay: string;
    overlayOpacity: number;
    overlayBlendMode: string;
    availableOverlays: {
        id: string;
        name: string;
        previewClass: string;
    }[];
    availableBlendModes: {
        value: string;
        label: string;
    }[];
}

interface Sticker {
    id: string;
    imageUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scale: number;
}

interface EffectsState {
    glitchIntensity: number;
    noiseIntensity: number;
    rgbShiftIntensity: number;
    activeEffect: 'none' | 'glitch' | 'noise' | 'rgb';
    availableEffects: {
        id: string;
        name: string;
        imageUrl: string;
        description: string;
        intensityName: string;
    }[];
}

interface Template {
    name: string;
    aspectRatio: Aspect;
    rotatedAngle: number;
    basicAdjustments: BasicAdjustmentsState;
    imageUrl: string;
    texts: TextPropertiesState[];
    stickers: string[];
    effect: string;
    filter: FilterState;
    overlay: OverlayState;
}

interface studioState {
    imageId: string;
    versionId: string;
    width: number;
    height: number;
    imageUrl: string;
    texts: TextPropertiesState[];
    selectedTextId: number | null;
    brush: BrushState;
    basicAdjustments: BasicAdjustmentsState;
    transform: Transform;
    filters: FilterState;
    overlays: OverlayState;
    stickers: Sticker[];
    stickerCategories: string[];
    activeStickerCategory: string;
    stickerLibrary: {[category:string]: string[]};
    effects: EffectsState;
    templates: Template[];
    selectedTemplate: Template | null;
    activeFeature: string;
    isExporting: boolean;
    exportFormat: "png" | "jpg" | "webp";
    isSaving: boolean;
    canvasHistory: any[]; // Array to store canvas states as JSON
    historyIndex: number; // Current position in history stack
}

const initialState: studioState = {
    imageId: "",
    versionId: "",
    height: 0,
    width: 0,
    imageUrl: "",
    texts: [],
    selectedTextId: null,
    brush: {
        hardness: 100,
        size: 15,
        color: "#ffffff",
        opacity: 50,
    },
    basicAdjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        gamma: 0,
        convolute: 0,
    },
    transform: {
        width: 0,
        height: 0,
        showAspects: false,
        selectedAspect: null,
        rotatedAngle: 0,
        flippedX: false,
        flippedY: false,
    },

    filters: {
        selectedFilter: "none",
        filterIntensity: 30,
        availableFilters: [
            { id: 'none', name: 'None', previewClass: 'bg-transparent bg-[url(/filters/none.png)] bg-center bg-cover' },
            { id: 'grayscale', name: 'GrayScale', previewClass: 'bg-gradient-to-r from-gray-300 to-gray-300 bg-[url(/filters/grayscale.png)] bg-center bg-cover' },
            { id: 'sepia', name: 'Sepia', previewClass: 'bg-gradient-to-r from-yellow-200 to-amber-300 bg-[url(/filters/sepia.png)] bg-center bg-cover' },
            { id: 'vintage', name: 'Vintage', previewClass: 'bg-gradient-to-r from-amber-100 to-amber-200 bg-[url(/filters/vintage.png)] bg-center bg-cover' },
            { id: 'vibrant', name: 'Vibrant', previewClass: 'bg-gradient-to-r from-blue-200 to-purple-200 bg-[url(/filters/vibrant.png)] bg-center bg-cover' },
            { id: 'cool', name: 'Cool', previewClass: 'bg-gradient-to-r from-cyan-200 to-blue-300 bg-[url(/filters/cool.png)] bg-center bg-cover' },
            { id: 'warm', name: 'Warm', previewClass: 'bg-gradient-to-r from-orange-200 to-red-200 bg-[url(/filters/warm.png)] bg-center bg-cover' },
            { id: 'dramatic', name: 'Dramatic', previewClass: 'bg-gradient-to-r from-slate-700 to-slate-900 bg-[url(/filters/dramatic.png)] bg-center bg-cover' },
            { id: 'dreamy', name: 'Dreamy', previewClass: 'bg-gradient-to-r from-purple-100 to-pink-100 bg-[url(/filters/dreamy.png)] bg-center bg-cover' },
            { id: 'polaroid', name: 'Polaroid', previewClass: 'bg-gradient-to-r from-amber-50 to-amber-100 bg-[url(/filters/polaroid.png)] bg-center bg-cover' },
            { id: 'neo_noir', name: 'Neo Noir', previewClass: 'bg-gradient-to-r from-gray-900 to-purple-900 bg-[url(/filters/neo_noir.png)] bg-center bg-cover' },
            { id: 'cyberpunk', name: 'Cyberpunk', previewClass: 'bg-gradient-to-r from-pink-500 to-cyan-500 bg-[url(/filters/cyberpunk.png)] bg-center bg-cover' },
            { id: 'pastel', name: 'Pastel', previewClass: 'bg-gradient-to-r from-pink-200 to-blue-200 bg-[url(/filters/pastel.png)] bg-center bg-cover' },
            { id: 'hdr', name: 'HDR', previewClass: 'bg-gradient-to-r from-gray-900 via-gray-300 to-white bg-[url(/filters/hdr.png)] bg-center bg-cover' },
            { id: 'tilt_shift', name: 'Tilt Shift', previewClass: 'bg-gradient-to-r from-green-200 to-blue-200 bg-[url(/filters/tilt_shift.png)] bg-center bg-cover' },
        ]

    },

    overlays: {
        selectedOverlay: "none",
        overlayOpacity: 50,
        overlayBlendMode: "normal",
        availableOverlays: [
            { id: 'none', name: 'None', previewClass: 'bg-transparent' },
            { id: 'light_leak', name: 'Light Leak', previewClass: 'bg-gradient-to-br from-yellow-200/70 to-pink-200/70 bg-[url(/textures/light-leak.png)]' },
            { id: 'grain', name: 'Grain', previewClass: 'bg-gray-600/20 bg-[url(/textures/grain.png)]' },
            { id: 'vignette', name: 'Vignette', previewClass: 'bg-radial-gradient bg-[url(/textures/vignette.jpg)]' },
            { id: 'rain', name: 'Rain', previewClass: 'bg-blue-900/20 bg-[url(/textures/rain.jpg)]' },
            { id: 'bokeh', name: 'Bokeh', previewClass: 'bg-blue-900/10 bg-[url(/textures/bokeh.jpg)]' },
            { id: 'hearts', name: 'Hearts', previewClass: 'bg-pink-100/30 bg-[url(/textures/hearts.jpeg)]' },
            { id: 'stars', name: 'Stars', previewClass: 'bg-blue-900/10 bg-[url(/textures/stars.jpg)]' },
            { id: 'golden', name: 'Golden', previewClass: 'bg-yellow-500/30 bg-[url(/textures/golden.jpg)]' },
            { id: 'metal', name: 'Metal', previewClass: 'bg-gray-300/40 bg-[url(/textures/metal.jpg)]' },
            { id: 'paper', name: 'Paper', previewClass: 'bg-amber-50/30 bg-[url(/textures/paper.jpg)]' },
            { id: 'wood', name: 'Wood', previewClass: 'bg-amber-200/30 bg-[url(/textures/wood.jpg)]' },
        ],
        availableBlendModes: [
            { value: 'normal', label: 'Normal' },
            { value: 'multiply', label: 'Multiply' },
            { value: 'screen', label: 'Screen' },
            { value: 'overlay', label: 'Overlay' },
            { value: 'darken', label: 'Darken' },
            { value: 'lighten', label: 'Lighten' },
            { value: 'color-dodge', label: 'Color Dodge' },
            { value: 'color-burn', label: 'Color Burn' },
            { value: 'hard-light', label: 'Hard Light' },
            { value: 'soft-light', label: 'Soft Light' },
        ]
    },

    stickers: [],
    stickerCategories: ['Emoji', 'Animals', 'Food', 'Travel', 'Objects', 'Love'],
    activeStickerCategory: 'Emoji',
    stickerLibrary: {
        Emoji: [
            '/stickers/emoji/cry.png',
            '/stickers/emoji/exploding_head.png',
            '/stickers/emoji/face_with_hand_over_mouth.png',
            '/stickers/emoji/face_with_monocle.png',
            '/stickers/emoji/female-student.png',
            '/stickers/emoji/female-technologist.png',
            '/stickers/emoji/grin.png',
            '/stickers/emoji/hugging_face.png',
            '/stickers/emoji/innocent.png',
            '/stickers/emoji/male-student.png',
            '/stickers/emoji/man-woman-girl-boy.png',
            '/stickers/emoji/sleeping.png',
            '/stickers/emoji/smirk.png',
            '/stickers/emoji/sob.png',
            '/stickers/emoji/speak_no_evil.png',
            '/stickers/emoji/see_no_evil.png',
            '/stickers/emoji/hear_no_evil.png',
            '/stickers/emoji/star-struck.png',
            '/stickers/emoji/stuck_out_tongue.png',
            '/stickers/emoji/triumph.png',
            '/stickers/emoji/wink.png',
            '/stickers/emoji/woman-tipping-hand.png',
            '/stickers/emoji/yum.png',
            '/stickers/emoji/+1.png',
            '/stickers/emoji/-1.png',
            '/stickers/emoji/crossed_fingers.png',
            '/stickers/emoji/pray.png',
        ],
        Animals: [
            '/stickers/animals/butterfly.png',
            '/stickers/animals/deer.png',
            '/stickers/animals/dog.png',
            '/stickers/animals/dolphin.png',
            '/stickers/animals/dromedary_camel.png',
            '/stickers/animals/feet.png',
            '/stickers/animals/hatched_chick.png',
            '/stickers/animals/panda_face.png',
            '/stickers/animals/snail.png',
            '/stickers/animals/snake.png',
            '/stickers/animals/tiger.png',
            '/stickers/animals/turtle.png',
            '/stickers/animals/unicorn_face.png',
            '/stickers/animals/wolf.png',
            '/stickers/animals/zebra_face.png',
        ],
        Food: [
            '/stickers/food/apple.png',
            '/stickers/food/birthday.png',
            '/stickers/food/broccoli.png',
            '/stickers/food/burrito.png',
            '/stickers/food/cake.png',
            '/stickers/food/cookie.png',
            '/stickers/food/corn.png',
            '/stickers/food/dango.png',
            '/stickers/food/doughnut.png',
            '/stickers/food/fries.png',
            '/stickers/food/glass_of_milk.png',
            '/stickers/food/grapes.png',
            '/stickers/food/green_salad.png',
            '/stickers/food/hamburger.png',
            '/stickers/food/icecream.png',
            '/stickers/food/lemon.png',
            '/stickers/food/pancakes.png',
            '/stickers/food/pizza.png',
            '/stickers/food/popcorn.png',
            '/stickers/food/shaved_ice.png',
            '/stickers/food/sushi.png',
            '/stickers/food/taco.png',
            '/stickers/food/tangerine.png',
            '/stickers/food/tea.png',
        ],
        Travel: [
            '/stickers/travel/airplane.png',
            '/stickers/travel/ambulance.png',
            '/stickers/travel/articulated_lorry.png',
            '/stickers/travel/beach_with_umbrella.png',
            '/stickers/travel/bike.png',
            '/stickers/travel/bus.png',
            '/stickers/travel/derelict_house_building.png',
            '/stickers/travel/earth_asia.png',
            '/stickers/travel/helicopter.png',
            '/stickers/travel/light_rail.png',
            '/stickers/travel/metro.png',
            '/stickers/travel/monorail.png',
            '/stickers/travel/motor_boat.png',
            '/stickers/travel/motor_scooter.png',
            '/stickers/travel/mountain_cableway.png',
            '/stickers/travel/national_park.png',
            '/stickers/travel/police_car.png',
            '/stickers/travel/rocket.png',
            '/stickers/travel/ship.png',
            '/stickers/travel/snow_capped_mountain.png',
            '/stickers/travel/stadium.png',
            '/stickers/travel/sunrise_over_mountains.png',
        ],
        Objects: [
            '/stickers/objects/bell.png',
            '/stickers/objects/books.png',
            '/stickers/objects/bulb.png',
            '/stickers/objects/confetti_ball.png',
            '/stickers/objects/gift.png',
            '/stickers/objects/hammer_and_wrench.png',
            '/stickers/objects/lower_left_fountain_pen.png',
            '/stickers/objects/musical_keyboard.png',
            '/stickers/objects/paperclip.png',
            '/stickers/objects/phone.png',
            '/stickers/objects/scissors.png',
            '/stickers/objects/sound.png',
            '/stickers/objects/tada.png',
            '/stickers/objects/tv.png',
            '/stickers/objects/violin.png',
        ],
        Love: [
            '/stickers/love/black_heart.png',
            '/stickers/love/blue_heart.png',
            '/stickers/love/gift_heart.png',
            '/stickers/love/green_heart.png',
            '/stickers/love/heart.png',
            '/stickers/love/heart_decoration.png',
            '/stickers/love/heartpulse.png',
            '/stickers/love/heavy_heart_exclamation_mark_ornament.png',
            '/stickers/love/orange_heart.png',
            '/stickers/love/purple_heart.png',
            '/stickers/love/revolving_hearts.png',
            '/stickers/love/sparkling_heart.png',
            '/stickers/love/yellow_heart.png',
        ],
    },
    effects: {
        glitchIntensity: 50,
        noiseIntensity: 30,
        rgbShiftIntensity: 20,
        activeEffect: 'none',
        availableEffects: [
            {
                id: 'glitch',
                name: 'Glitch',
                imageUrl: '/effects/glitch.jpg',
                description: 'Digital glitch distortion effect',
                intensityName: 'Distortion',
            },
            {
                id: 'noise',
                name: 'Noise',
                imageUrl: '/effects/noise.jpg',
                description: 'Film grain and noise overlay',
                intensityName: 'Grain',
            },
            {
                id: 'rgb',
                name: 'RGB Shift',
                imageUrl: '/effects/rgb.jpg',
                description: 'Color channel split effect',
                intensityName: 'Shift',
            },
        ],
    },
    templates: [
        {
            name: "Colorful Life",
            aspectRatio: { width: 1, height: 1 },
            rotatedAngle: 0,
            basicAdjustments: {
                brightness: 50,
                contrast: 0,
                saturation: 0,
                gamma: 0,
                convolute: 0,
            },
            imageUrl: "/templates/colorful_life.png",
            texts: [],
            stickers: [],
            effect: "",
            filter: {
                selectedFilter: "none",
                filterIntensity: 100,
                availableFilters: []
            },
            overlay: {
                selectedOverlay: "none",
                overlayOpacity: 50,
                overlayBlendMode: "normal",
                availableOverlays: [],
                availableBlendModes: []
            },
        },
        {
            name: "Night Shade",
            aspectRatio: { width: 1, height: 1 },
            rotatedAngle: 45,
            basicAdjustments: {
                brightness: 0,
                contrast: 0,
                saturation: 0,
                gamma: 0,
                convolute: 0,
            },
            imageUrl: "/templates/night_shade.png",
            texts: [],
            stickers: [],
            effect: "glitch",
            filter: {
                selectedFilter: "sepia",
                filterIntensity: 100,
                availableFilters: []
            },
            overlay: {
                selectedOverlay: "vignette",
                overlayOpacity: 50,
                overlayBlendMode: "normal",
                availableOverlays: [],
                availableBlendModes: []
            },
        },
        {
            name: "Be Patient",
            aspectRatio: { width: 3, height: 4 },
            rotatedAngle: 0,
            basicAdjustments: {
                brightness: 10,
                contrast: 0,
                saturation: 0,
                gamma: 0,
                convolute: 0,
            },
            imageUrl: "/templates/be_patient.png",
            texts: [],
            stickers: [],
            effect: "",
            filter: {
                selectedFilter: "hdr",
                filterIntensity: 30,
                availableFilters: []
            },
            overlay: {
                selectedOverlay: "rain",
                overlayOpacity: 100,
                overlayBlendMode: "multiply",
                availableOverlays: [],
                availableBlendModes: []
            },
        },
    ],
    selectedTemplate: null,
    activeFeature: "text",
    isExporting: false,
    exportFormat: "png",
    isSaving: false,
    canvasHistory: [],
    historyIndex: -1,
};

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchImageUrl = createAsyncThunk(
    "studio/fetchImageUrl",
    async ({ imageId, versionId }: { imageId: string; versionId: string }) => {
        try {
            const response = await axios.post(
                `${baseUrl}/studio/get_image`,
                {
                    imageId,
                    versionId,
                }
            );
            return response.data.url;
        } catch (error) {
            console.error("Error fetching image URL:", error);
            throw error;
        }
    }
);

const studioSlice = createSlice({
    name: "studio",
    initialState,
    reducers: {
        setImageId: (state, action: PayloadAction<string>) => {
            state.imageId = action.payload;
        },
        setVersionId: (state, action: PayloadAction<string>) => {
            state.versionId = action.payload;
        },
        setImageWidth: (state, action: PayloadAction<number>) => {
            state.width = action.payload;
        },
        setImageHeight: (state, action: PayloadAction<number>) => {
            state.height = action.payload;
        },
        // New actions for text properties
        setFontColor: (state, action: PayloadAction<updateString>) => {
            state.texts[action.payload.id].fontColor = action.payload.value;
        },
        setFontColorOpacity: (state, action: PayloadAction<updateNumber>) => {
            state.texts[action.payload.id].fontColorOpacity = action.payload.value;
        },
        setBackgroundColor: (state, action: PayloadAction<updateString>) => {
            state.texts[action.payload.id].backgroundColor = action.payload.value;
        },
        setBackgroundColorOpacity: (state, action: PayloadAction<updateNumber>) => {
            state.texts[action.payload.id].backgroundColorOpacity =
                action.payload.value;
        },
        setFontFamily: (state, action: PayloadAction<updateString>) => {
            state.texts[action.payload.id].fontFamily = action.payload.value;
        },
        setFontSize: (state, action: PayloadAction<updateNumber>) => {
            state.texts[action.payload.id].fontSize = action.payload.value;
        },
        setLineSpacing: (state, action: PayloadAction<updateNumber>) => {
            state.texts[action.payload.id].lineSpacing = action.payload.value;
        },
        setTextAlign: (state, action: PayloadAction<updateAlign>) => {
            state.texts[action.payload.id].textAlign = action.payload.value;
        },
        // New actions for brush properties
        setBrushHardness: (state, action: PayloadAction<number>) => {
            state.brush.hardness = action.payload;
        },
        setBrushSize: (state, action: PayloadAction<number>) => {
            state.brush.size = action.payload;
        },
        setBrushColor: (state, action: PayloadAction<string>) => {
            state.brush.color = action.payload;
        },
        setBrushOpacity: (state, action: PayloadAction<number>) => {
            state.brush.opacity = action.payload;
        },
        // New actions for basic adjustments
        setBrightness: (state, action: PayloadAction<number>) => {
            state.basicAdjustments.brightness = action.payload;
        },
        setContrast: (state, action: PayloadAction<number>) => {
            state.basicAdjustments.contrast = action.payload;
        },
        setSaturation: (state, action: PayloadAction<number>) => {
            state.basicAdjustments.saturation = action.payload;
        },
        setGamma: (state, action: PayloadAction<number>) => {
            state.basicAdjustments.gamma = action.payload;
        },
        setConvolute: (state, action: PayloadAction<number>) => {
            state.basicAdjustments.convolute = action.payload;
        },
        // New actions for transform properties
        setTransformWidth: (state, action: PayloadAction<number>) => {
            state.transform.width = action.payload;
        },
        setTransformHeight: (state, action: PayloadAction<number>) => {
            state.transform.height = action.payload;
        },
        setShowAspects: (state, action: PayloadAction<boolean>) => {
            state.transform.showAspects = action.payload;
        },
        setSelectedAspect: (state, action: PayloadAction<Aspect | null>) => {
            state.transform.selectedAspect = action.payload;
        },
        setRotatedAngle: (state, action: PayloadAction<number>) => {
            state.transform.rotatedAngle = action.payload;
        },
        RotateImageCw: (state) => {
            state.transform.rotatedAngle = (state.transform.rotatedAngle + 90) % 360;
        },
        RotateImageCcw: (state) => {
            state.transform.rotatedAngle = state.transform.rotatedAngle - 90;
            if (state.transform.rotatedAngle < 0) {
                state.transform.rotatedAngle = 360 + state.transform.rotatedAngle;
            }
        },
        FlipImageHorizontal: (state) => {
            state.transform.flippedX = !state.transform.flippedX;
        },
        FlipImageVertical: (state) => {
            state.transform.flippedY = !state.transform.flippedY;
        },

        setSelectedFilter: (state, action: PayloadAction<string>) => {
            state.filters.selectedFilter = action.payload;
        },
        setFilterIntensity: (state, action: PayloadAction<number>) => {
            state.filters.filterIntensity = action.payload;
        },

        setSelectedOverlay: (state, action: PayloadAction<string>) => {
            console.log("Selected overlay:", action.payload);
            state.overlays.selectedOverlay = action.payload;
        },
        setOverlayOpacity: (state, action: PayloadAction<number>) => {
            console.log("Overlay opacity:", action.payload);
            state.overlays.overlayOpacity = action.payload;
        },
        setOverlayBlendMode: (state, action: PayloadAction<string>) => {
            console.log("Overlay blend mode:", action.payload);
            state.overlays.overlayBlendMode = action.payload;
        },
        setActiveStickerCategory: (state, action: PayloadAction<string>) => {
            state.activeStickerCategory = action.payload;
        },
        addSticker: (state, action: PayloadAction<{ imageUrl: string }>) => {
            const { imageUrl } = action.payload;
            const newSticker: Sticker = {
                id: `sticker-${Date.now()}`, // Generate unique ID
                imageUrl,
                x: state.width / 2, // Center on canvas
                y: state.height / 2,
                width: 100, // Default size
                height: 100,
                rotation: 0,
                scale: 1
            };
            state.stickers.push(newSticker);
        },
        
        updateStickerPosition: (state, action: PayloadAction<{ id: string, x: number, y: number }>) => {
            const { id, x, y } = action.payload;
            const stickerIndex = state.stickers.findIndex(sticker => sticker.id === id);
            if (stickerIndex !== -1) {
                state.stickers[stickerIndex].x = x;
                state.stickers[stickerIndex].y = y;
            }
        },
        
        updateStickerSize: (state, action: PayloadAction<{ id: string, width: number, height: number }>) => {
            const { id, width, height } = action.payload;
            const stickerIndex = state.stickers.findIndex(sticker => sticker.id === id);
            if (stickerIndex !== -1) {
                state.stickers[stickerIndex].width = width;
                state.stickers[stickerIndex].height = height;
            }
        },
        
        updateStickerRotation: (state, action: PayloadAction<{ id: string, rotation: number }>) => {
            const { id, rotation } = action.payload;
            const stickerIndex = state.stickers.findIndex(sticker => sticker.id === id);
            if (stickerIndex !== -1) {
                state.stickers[stickerIndex].rotation = rotation;
            }
        },
        
        updateStickerScale: (state, action: PayloadAction<{ id: string, scale: number }>) => {
            const { id, scale } = action.payload;
            const stickerIndex = state.stickers.findIndex(sticker => sticker.id === id);
            if (stickerIndex !== -1) {
                state.stickers[stickerIndex].scale = scale;
            }
        },
        
        deleteSticker: (state, action: PayloadAction<string>) => {
            state.stickers = state.stickers.filter(sticker => sticker.id !== action.payload);
        },
        setActiveEffect: (state, action: PayloadAction<'none' | 'glitch' | 'noise' | 'rgb'>) => {
            state.effects.activeEffect = action.payload;
        },
        setGlitchIntensity: (state, action: PayloadAction<number>) => {
            state.effects.glitchIntensity = action.payload;
        },
        setNoiseIntensity: (state, action: PayloadAction<number>) => {
            state.effects.noiseIntensity = action.payload;
        },
        setRgbShiftIntensity: (state, action: PayloadAction<number>) => {
            state.effects.rgbShiftIntensity = action.payload;
        },
        setActiveFeature: (state, action: PayloadAction<string>) => {
            state.activeFeature = action.payload;
        },
        // Text management actions
        addNewText: (state) => {
            const newId = state.texts.length > 0
                ? Math.max(...state.texts.map(text => text.id)) + 1
                : 0;

            const newText: TextPropertiesState = {
                id: newId,
                positionX: state.width / 2 - 50,
                positionY: state.height / 2 - 15,
                rotatedAngle: 0,
                width: 70,
                fontFamily: "Arial, sans-serif",
                fontSize: 16,
                fontColor: "#000000",
                fontColorOpacity: 100,
                backgroundColor: "#ffffff",
                backgroundColorOpacity: 100,
                lineSpacing: 1.5,
                textAlign: "left",
                content: "New Text",
            };
            state.texts.push(newText);
            state.selectedTextId = newId;
        },

        deleteText: (state, action: PayloadAction<number>) => {
            const textId = action.payload;
            state.texts = state.texts.filter(text => text.id !== textId);

            // If the deleted text was selected, select another text or null
            if (state.selectedTextId === textId) {
                state.selectedTextId = state.texts.length > 0 ? state.texts[0].id : null;
            }
        },

        selectText: (state, action: PayloadAction<number | null>) => {
            state.selectedTextId = action.payload;
        },

        setTextContent: (state, action: PayloadAction<updateContent>) => {
            const { id, content } = action.payload;
            const textIndex = state.texts.findIndex(text => text.id === id);
            if (textIndex !== -1) {
                state.texts[textIndex].content = content;
            }
        },

        setTextPosition: (state, action: PayloadAction<updatePosition>) => {
            const { id, positionX, positionY } = action.payload;
            const textIndex = state.texts.findIndex(text => text.id === id);
            if (textIndex !== -1) {
                state.texts[textIndex].positionX = positionX;
                state.texts[textIndex].positionY = positionY;
            }
        },

        setTextRotation: (state, action: PayloadAction<updateRotation>) => {
            const { id, rotatedAngle } = action.payload;
            const textIndex = state.texts.findIndex(text => text.id === id);
            if (textIndex !== -1) {
                state.texts[textIndex].rotatedAngle = rotatedAngle;
            }
        },

        duplicateText: (state, action: PayloadAction<number>) => {
            const textId = action.payload;
            const textToDuplicate = state.texts.find(text => text.id === textId);
            console.log("selected text for duplication: ", textToDuplicate);

            if (textToDuplicate) {
                const newId = Math.max(...state.texts.map(text => text.id)) + 1;
                const duplicatedText = {
                    ...textToDuplicate,
                    id: newId,
                    positionX: textToDuplicate.positionX + 20,
                    positionY: textToDuplicate.positionY + 20,
                };
                console.log("Text duplicated:", duplicatedText);
                state.texts = [...state.texts, duplicatedText];
                console.log("texts", state.texts);
                state.selectedTextId = newId;
            }
        },
        setWidth: (state, action: PayloadAction<updateWidth>) => {
            state.texts[action.payload.id].width = action.payload.width;
        },
        updateTextContent: (state, action: PayloadAction<updateString>) => {
            state.texts[action.payload.id].content = action.payload.value;
        },
        saveCanvasState: (state, action: PayloadAction<any>) => {
            // Extract the canvas JSON data
            const canvasData = action.payload.canvasData;
            
            // Create a complete state object with metadata
            const completeState = {
                canvasData,
                metadata: {
                    basicAdjustments: { ...state.basicAdjustments },
                    transform: { 
                        width: state.transform.width,
                        height: state.transform.height,
                        rotatedAngle: state.transform.rotatedAngle,
                        flippedX: state.transform.flippedX,
                        flippedY: state.transform.flippedY
                    },
                    filters: {
                        selectedFilter: state.filters.selectedFilter,
                        filterIntensity: state.filters.filterIntensity
                    },
                    effects: {
                        activeEffect: state.effects.activeEffect,
                        glitchIntensity: state.effects.glitchIntensity,
                        noiseIntensity: state.effects.noiseIntensity,
                        rgbShiftIntensity: state.effects.rgbShiftIntensity
                    },
                    overlays: {
                        selectedOverlay: state.overlays.selectedOverlay,
                        overlayOpacity: state.overlays.overlayOpacity,
                        overlayBlendMode: state.overlays.overlayBlendMode
                    },
                    texts: [...state.texts], // Deep copy of all text objects
                    selectedTextId: state.selectedTextId,
                    
                    brush: { ...state.brush },
                    stickers: [...state.stickers], // Deep copy of all sticker objects
                }
            };
            
            // Remove any future states if we're in the middle of history
            let newHistory = state.canvasHistory.slice(0, state.historyIndex + 1);
            newHistory.push(completeState);

            const MAX_HISTORY_LENGTH = 10;
            if (newHistory.length > MAX_HISTORY_LENGTH) {
                // Remove oldest states
                const excessStates = newHistory.length - MAX_HISTORY_LENGTH;
                newHistory = newHistory.slice(excessStates);
                // Adjust current index to match the new array
                state.historyIndex = Math.max(0, state.historyIndex - excessStates);
            } else {
                // If we didn't exceed limit, just update the index
                state.historyIndex = newHistory.length - 1;
            }
            
            state.canvasHistory = newHistory;
            state.historyIndex = newHistory.length - 1;
        },
        
        // Move back in history
        undoCanvasState: (state) => {
            if (state.historyIndex > 0) {
                state.historyIndex -= 1;
            }
        },
        
        // Move forward in history
        redoCanvasState: (state) => {
            if (state.historyIndex < state.canvasHistory.length - 1) {
                state.historyIndex += 1;
            }
        },
        replaceTexts: (state, action: PayloadAction<TextPropertiesState[]>) => {
            state.texts = action.payload;
        },
        setIsExporting: (state, action: PayloadAction<boolean>) => {
            state.isExporting = action.payload;
        },
        setExportFormat: (state, action: PayloadAction<"png" | "jpg" | "webp">) => {
            state.exportFormat = action.payload;
        },
        setIsSaving: (state, action: PayloadAction<boolean>) => {
            state.isSaving = action.payload;
        },
        setSelectedTemplate: (state, action: PayloadAction<Template | null>) => {
            state.selectedTemplate = action.payload;
        },
        replaceStickers: (state, action: PayloadAction<Sticker[]>) => {
            state.stickers = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchImageUrl.fulfilled, (state, action) => {
                state.imageUrl = action.payload;
            })
            .addCase(fetchImageUrl.rejected, (state, action) => {
                console.error("Error fetching image URL:", action.error);
            })
            .addCase(fetchImageUrl.pending, () => {
                console.log("Fetching image URL...");
            });
    },
});

const studioReducer = studioSlice.reducer;
export default studioReducer;

export const {
    setImageId,
    setVersionId,
    setImageHeight,
    setImageWidth,
    setFontColor,
    setFontColorOpacity,
    setBackgroundColor,
    setBackgroundColorOpacity,
    setFontFamily,
    setFontSize,
    setLineSpacing,
    setTextAlign,
    setBrushHardness,
    setBrushSize,
    setBrushColor,
    setBrushOpacity,
    setBrightness,
    setContrast,
    setSaturation,
    setGamma,
    setConvolute,
    setTransformWidth,
    setTransformHeight,
    setShowAspects,
    setSelectedAspect,
    setRotatedAngle,
    FlipImageHorizontal,
    FlipImageVertical,
    RotateImageCcw,
    RotateImageCw,
    setSelectedFilter,
    setFilterIntensity,
    setSelectedOverlay,
    setOverlayOpacity,
    setOverlayBlendMode,
    addSticker,
    updateStickerPosition,
    updateStickerSize,
    updateStickerRotation,
    updateStickerScale,
    deleteSticker,
    setActiveStickerCategory,
    setActiveEffect,
    setGlitchIntensity,
    setNoiseIntensity,
    setRgbShiftIntensity,
    setActiveFeature,
    addNewText,
    deleteText,
    selectText,
    setTextContent,
    setTextPosition,
    setTextRotation,
    duplicateText,
    setWidth,
    updateTextContent,
    setIsExporting,
    setExportFormat,
    saveCanvasState,
    undoCanvasState,
    redoCanvasState,
    replaceTexts,
    setIsSaving,
    setSelectedTemplate,
    replaceStickers
} = studioSlice.actions;
