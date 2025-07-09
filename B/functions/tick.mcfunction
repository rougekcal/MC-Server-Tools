replaceitem entity @a slot.hotbar 8 clock 1 1 {"minecraft:keep_on_death":{},"minecraft:item_lock":{"mode":"lock_in_slot"}}
clear @a[hasitem={item=clock,data=1,quantity=!1}] clock 1 64
scoreboard players add @a money 0
