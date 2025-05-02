#!/bin/bash

# Install shadcn CLI
npm install -D @shadcn/ui

# Initialize shadcn
npx shadcn-ui@latest init --yes

# Install components we'll need
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add select
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add input
npx shadcn-ui@latest add progress

# Signal completion
echo "shadcn components have been installed!"