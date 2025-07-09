import { system, world } from '@minecraft/server';
import './lz-string.js';
import { initializeLanguageSystem } from './language/language.js';
import { initializeCommandSystem } from './command.js';
import { initializeEconomy } from './economy.js';
import { initializeAnnouncement } from './announcement.js';
import { initializeCombatSystem } from './combatRewards.js';
import { initializeMenu } from './menu.js';
import { initializeHome } from './home.js';
import { initializeTeleport } from './teleport.js';
import { initializeDeathLocations, initializeRespawnReturn } from './utils.js';

const MODULES = [
    { name: "语言系统", init: initializeLanguageSystem },
    { name: "指令系统", init: initializeCommandSystem },
    { name: "经济系统", init: initializeEconomy },
    { name: "公告系统", init: initializeAnnouncement },
    { name: "战斗系统", init: initializeCombatSystem },
    { name: "菜单系统", init: initializeMenu },
    { name: "家系统", init: initializeHome },
    { name: "传送系统", init: initializeTeleport },
    { name: "死亡位置系统", init: initializeDeathLocations },
    { name: "重生返回系统", init: initializeRespawnReturn }
];

function startSystemTicker() {
    system.runInterval(() => {
        try {
            if (world.getDimension) {
                const overworld = world.getDimension("overworld");
                if (overworld && overworld.runCommand) {
                    overworld.runCommand("function system/tick");
                }
            }
        } catch (e) {
            console.error("[系统tick] 执行命令错误:", e);
        }
    }, 1);
}

export function initialize() {
    console.log("=== 系统初始化开始 ===");
    
    system.runTimeout(() => {
        console.log("=== 开始加载模块 ===");
        
        MODULES.forEach(module => {
            console.log(`[初始化] ${module.name}`);
            try {
                module.init();
                console.log(`[完成] ${module.name}`);
            } catch (e) {
                console.error(`[错误] ${module.name} 初始化失败:`, e);
            }
        });
        
        console.log("=== 系统状态 ===");
        console.log("版本: V1.1.1-beta");
        console.log("所有模块已加载");
        console.log("欢迎使用MCTools脚本系统");
        console.log("请使用钟表打开菜单");
        console.log("如有问题请联系作者");
        console.log("作者: NEO天才小白");
        console.log("GitHub:rougekcal");
        console.log("QQ群: 2088489322");
        console.log("技术支持QQ: 2088489322");
        
        startSystemTicker();
    }, 100);
}

initialize();
