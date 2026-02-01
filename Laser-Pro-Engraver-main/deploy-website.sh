#!/bin/bash
# Deploy Website to GitHub Pages
# This script helps you deploy the gh-pages branch

echo "================================================"
echo "LaserTrace Pro - GitHub Pages Deployment"
echo "================================================"
echo ""

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "✅ gh-pages branch exists locally"
else
    echo "❌ gh-pages branch not found"
    echo "Creating gh-pages branch..."
    
    # Create gh-pages branch
    git checkout -b gh-pages
    
    # Remove all files except website
    git rm -rf $(ls -A | grep -v -E '\.git|website')
    
    # Copy website content to root
    cp -r website/* .
    rm -rf website
    
    # Update README
    cat > README.md << 'EOF'
# LaserTrace Pro - Product Recommendation Website

This is the static website for LaserTrace Pro product recommendations.

## Live Site
https://op-era.github.io/Laser-Pro-Engraver/

## Editing
Edit index.html to update content and add affiliate links.

© 2026 Shane Foster
EOF
    
    # Commit
    git add -A
    git commit -m "Setup gh-pages branch with website content"
    
    echo "✅ gh-pages branch created"
fi

echo ""
echo "Attempting to push gh-pages branch..."
echo ""

# Try to push
if git push -u origin gh-pages; then
    echo ""
    echo "✅ Successfully pushed gh-pages branch!"
    echo ""
    echo "Next steps:"
    echo "1. Go to: https://github.com/Op-era/Laser-Pro-Engraver/settings/pages"
    echo "2. Set source to 'gh-pages' branch and '/ (root)' folder"
    echo "3. Wait a few minutes for deployment"
    echo "4. Visit: https://op-era.github.io/Laser-Pro-Engraver/"
    echo ""
else
    echo ""
    echo "❌ Failed to push gh-pages branch"
    echo ""
    echo "Manual steps:"
    echo "1. git checkout gh-pages"
    echo "2. git push -u origin gh-pages"
    echo ""
    echo "Or push through GitHub web interface:"
    echo "1. Go to repository on GitHub"
    echo "2. Click 'Create new branch' and name it 'gh-pages'"
    echo "3. Upload index.html and README.md files"
    echo ""
fi

# Return to original branch
git checkout copilot/complete-feature-and-bug-testing

echo ""
echo "================================================"
echo "Deployment script completed"
echo "================================================"
