<script setup lang="ts">
// Site navigation
// Panels open on hover or click. Moving to the next trigger slides the panel across, and the viewport resizes to fit.

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/keyframery/navigation-menu"

const products = [
  { title: "Analytics", hint: "See what people do" },
  { title: "Automations", hint: "Run work on a schedule" },
  { title: "Reports", hint: "Share numbers with the team" },
  { title: "Integrations", hint: "Connect your tools" },
]
</script>

<template>
  <div class="flex h-[300px] w-full max-w-[560px] justify-center">
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="m-0 grid w-[400px] list-none grid-cols-2 gap-0.5 p-0">
              <li v-for="p in products" :key="p.title">
                <NavigationMenuLink href="#">
                  <span class="flex flex-col">
                    <span class="font-medium">{{ p.title }}</span>
                    <span class="text-[12px] text-muted-foreground">{{ p.hint }}</span>
                  </span>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="company">
          <NavigationMenuTrigger>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul class="m-0 grid w-[200px] list-none gap-0.5 p-0">
              <li v-for="title in ['About', 'Careers', 'Press']" :key="title">
                <NavigationMenuLink href="#">{{ title }}</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" current>Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
      <NavigationMenuViewport />
    </NavigationMenu>
  </div>
</template>
