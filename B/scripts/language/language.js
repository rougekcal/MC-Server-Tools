// language.js
import { world } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { zh_CN } from './zh_CN.js';
import { en_US } from './en_US.js';

// 默认语言
const DEFAULT_LANG = 'zh_CN';

// 语言数据存储键
const LANG_KEY = 'player_lang';
const GLOBAL_LANG_KEY = 'global_lang';

// 语言数据映射
const LANG_DATA = {
    zh_CN: zh_CN,
    en_US: en_US
};

// 语言名称映射
const LANG_NAMES = {
    zh_CN: '简体中文',
    en_US: 'English'
};

// 设置全局语言
export function setGlobalLanguage(langCode) {
    if (!LANG_DATA[langCode]) langCode = DEFAULT_LANG;
    
    try {
        world.setDynamicProperty(GLOBAL_LANG_KEY, langCode);
        return true;
    } catch (e) {
        console.error('[语言系统] 设置全局语言错误:', e);
        return false;
    }
}

// 获取全局语言
export function getGlobalLanguage() {
    try {
        return world.getDynamicProperty(GLOBAL_LANG_KEY) || DEFAULT_LANG;
    } catch (e) {
        console.error('[语言系统] 获取全局语言错误:', e);
        return DEFAULT_LANG;
    }
}

// 设置玩家语言
export function setPlayerLanguage(player, langCode) {
    if (!player || !player.isValid()) return false;
    
    if (!LANG_DATA[langCode]) langCode = DEFAULT_LANG;
    
    try {
        player.setDynamicProperty(LANG_KEY, langCode);
        return true;
    } catch (e) {
        console.error('[语言系统] 设置玩家语言错误:', e);
        return false;
    }
}

// 获取玩家语言
export function getPlayerLanguage(player) {
    try {
        // 处理 null 或无效的玩家对象
        if (!player || typeof player !== 'object') {
            return getGlobalLanguage();
        }
        
        // 检查 getDynamicProperty 方法是否存在
        if (typeof player.getDynamicProperty !== 'function') {
            console.warn('[语言系统] 玩家对象缺少 getDynamicProperty 方法');
            return getGlobalLanguage();
        }
        
        return player.getDynamicProperty(LANG_KEY) || getGlobalLanguage();
    } catch (e) {
        console.error('[语言系统] 获取玩家语言错误:', e);
        return DEFAULT_LANG;
    }
}

// 翻译文本 (带格式化参数)
export function translate(player, key, ...args) {
    try {
        const lang = getPlayerLanguage(player);
        const langSet = LANG_DATA[lang] || LANG_DATA[DEFAULT_LANG];
        let text = langSet[key] || LANG_DATA[DEFAULT_LANG][key] || key;
        
        // 替换参数占位符
        args.forEach((arg, i) => {
            text = text.replace(`%${i + 1}`, arg);
        });
        
        return text;
    } catch (e) {
        console.error(`[翻译] 错误: ${e.message} (键: ${key}, 玩家: ${player ? player.name : 'null'})`);
        return key; // 返回原始键作为回退
    }
}

// 安全注册语言切换命令
function tryRegisterLanguageCommand() {
    try {
        if (world.beforeEvents && world.beforeEvents.chatSend) {
            world.beforeEvents.chatSend.subscribe(handleLanguageCommand);
            console.log("[语言系统] 语言切换命令已注册");
        }
    } catch (e) {
        console.error('[语言系统] 注册命令错误:', e);
    }
}

// 处理语言切换命令
function handleLanguageCommand(event) {
    const player = event.sender;
    const message = event.message.toLowerCase();
    
    if (message === "/lang" || message === "/language" || message === "/语言") {
        event.cancel = true;
        showLanguageSelector(player);
    }
}

// 显示语言选择菜单
export async function showLanguageSelector(player = null) {
    try {
        const languages = Object.keys(LANG_DATA).map(code => ({
            code,
            name: LANG_NAMES[code] || code
        }));
        
        const currentLang = player ? getPlayerLanguage(player) : getGlobalLanguage();
        const currentLangName = languages.find(l => l.code === currentLang)?.name || currentLang;
        
        const form = new ActionFormData()
            .title(translate(player, "system.language_title")) // 添加翻译键
            .body(translate(player, "system.current_language", currentLangName)); // 添加翻译键
        
        languages.forEach(lang => {
            form.button(lang.name);
        });
        
        // 添加返回按钮
        form.button(translate(player, "system.back"), "textures/ui/back");
        
        
        let response;
        if (player && player.isValid()) {
            response = await form.show(player);
        } else {
            // 控制台选择
            console.log("=== 语言选择 ===");
            languages.forEach((lang, i) => {
                console.log(`${i + 1}. ${lang.name} (${lang.code})`);
            });
            console.log(`${languages.length + 1}. 取消`);
            
            // 在实际控制台中，您可能需要实现输入处理
            // 这里只是模拟选择默认语言
            response = { selection: 0, canceled: false };
        }
        
        if (response.canceled) return;
        
        // 处理取消按钮
        if (response.selection === languages.length) return;
        
        const selectedLang = languages[response.selection].code;
        
        if (player && player.isValid()) {
            setPlayerLanguage(player, selectedLang);
            player.sendMessage(`§a语言已切换至 ${selectedLang}`);
        } else {
            setGlobalLanguage(selectedLang);
            console.log(`[语言系统] 全局语言已设置为 ${selectedLang}`);
        }
    } catch (e) {
        console.error('[语言系统] 选择菜单错误:', e);
    }
}

// 初始化语言系统
export function initializeLanguageSystem() {
    console.log("[语言系统] 初始化开始");
    
    // 确保全局语言已设置
    try {
        if (world.getDynamicProperty(GLOBAL_LANG_KEY) === undefined) {
            setGlobalLanguage(DEFAULT_LANG);
            console.log(`[语言系统] 设置全局语言为 ${DEFAULT_LANG}`);
        }
    } catch (e) {
        console.error('[语言系统] 初始化全局语言错误:', e);
    }
    
    // 注册语言切换命令
    tryRegisterLanguageCommand();
    
    console.log("[语言系统] 初始化完成");
}
