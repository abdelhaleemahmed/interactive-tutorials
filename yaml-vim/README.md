# YAML & Vim Mastery Tutorial

**Interactive Tutorial** - Master YAML editing in Vim

## Overview

A comprehensive, self-contained interactive tutorial for mastering YAML configuration editing in Vim. This guide covers everything from basics to advanced techniques with hands-on demonstrations.

## Tutorial Sections

### 1. **Basics** 🎯
- Starting a new YAML file
- Auto-indentation features
- Auto-pair functionality
- Pro tips for new users
- Essential keyboard shortcuts

### 2. **Navigation** 🧭
- Folding YAML sections (`za`, `zR`, `zM`)
- Block navigation (`]}`, `[{`, `%`)
- File navigation with NERDTree and fuzzy finder
- Efficient navigation workflow
- Keyboard shortcuts for quick movement

### 3. **Indentation** 📏
- Visual selection indentation
- Multi-line indentation management
- Auto-indent entire files (`gg=G`)
- Fixing messy configurations
- Indentation best practices

### 4. **Validation** ✅
- Automatic linting with ALE
- Real-time YAML validation
- Error highlighting and detection
- Manual YAML formatting (`\y`)
- Validation checklist

### 5. **Advanced** 🚀
- Surrounding text operations (`cs`, `ds`, `ysi`)
- Multiple-line editing with visual block mode
- Find and replace (`:%s/old/new/gc`)
- Vim commands for power editing
- Advanced workflow techniques

### 6. **Examples** 🏗️
- **Kubernetes Configuration** - Complete K8s workflow
- **Docker Compose** - Multi-container management
- **CI/CD Pipeline** - GitHub Actions and GitLab CI
- **YAML Anchors** - Configuration reuse with `&` and `*`
- Real-world use cases and best practices

## Features

✅ **Interactive Demonstrations** - Click buttons to see live examples
✅ **Keyboard Shortcuts** - Clearly displayed and organized
✅ **Code Examples** - Real-world YAML configuration samples
✅ **Progress Tracking** - Visual progress bar shows your learning progress
✅ **Responsive Design** - Works on desktop and mobile devices
✅ **Self-Contained** - No external dependencies, single HTML file

## How to Use

1. **Open `index.html`** in your web browser
2. **Start with Basics** - Understand fundamental YAML editing
3. **Progress through sections** - Click tabs to navigate
4. **Try demonstrations** - Click demo buttons to see live examples
5. **Practice shortcuts** - Use keyboard shortcuts from examples
6. **Apply to real projects** - Use workflows for your YAML files

## Keyboard Shortcuts Quick Reference

| Shortcut | Action |
|----------|--------|
| `Tab` | Indent current line |
| `Shift+Tab` | Unindent current line |
| `za` | Toggle fold at cursor |
| `zM` | Close all folds |
| `zR` | Open all folds |
| `V` | Enter visual line mode |
| `Ctrl+v` | Enter visual block mode |
| `gg=G` | Auto-indent entire file |
| `:%s/old/new/gc` | Find and replace |
| `,y` | Invoke YAML formatter |
| `,n` | Open NERDTree |
| `,f` | Fuzzy file finder |

## Key Techniques

### Folding Large Files
```vim
zM  " Close all folds
/spec<Enter>  " Search for section
za  " Expand that section only
```

### Indentation Workflow
```vim
V       " Visual line mode
j/k     " Select lines
Tab     " Indent
Shift+Tab " Unindent
```

### Find and Replace
```vim
:%s/old_key/new_key/gc
```

### Visual Block Editing
```vim
Ctrl+v      " Visual block mode
j/k         " Select column
I           " Insert at beginning
# <space>   " Type changes
Esc         " Apply to all lines
```

## Real-World Use Cases

- **Kubernetes Deployments** - Navigate and edit complex K8s configs
- **Docker Compose** - Manage multi-container application stacks
- **CI/CD Pipelines** - Edit GitHub Actions and GitLab CI workflows
- **Configuration Management** - Edit Ansible, Terraform, and other IaC files
- **Application Configuration** - YAML config files for any application

## Best Practices

1. **Use 2-space indentation** - YAML standard
2. **Enable visual indentation guides** - Better alignment visibility
3. **Use auto-indent features** - Maintain consistency
4. **Validate with linters** - Catch errors before deployment
5. **Fold sections when needed** - Focus on relevant parts
6. **Use YAML anchors** - Reduce duplication in configs

## Integration with Vim

This tutorial assumes a configured Vim environment with:
- Syntax highlighting for YAML
- Indentation detection
- ALE (Asynchronous Lint Engine) for validation
- vim-surround plugin for text manipulation
- NERDTree for file navigation
- Optional: fuzzy finder (FZF) for fast searching

## Navigation Keyboard Shortcuts

- **Alt+Right Arrow** - Next section
- **Alt+Left Arrow** - Previous section
- **Tab buttons** - Direct section navigation
- **Smooth animations** - Visual feedback on interactions

## File Information

- **Type:** Interactive HTML Tutorial
- **Size:** 51KB (self-contained)
- **Content:** 6 sections with 15+ sub-topics
- **Code Examples:** 20+ real-world YAML examples
- **Interactive Demos:** 15+ demonstration buttons

## Back to Interactive Tutorials

[← Return to Interactive Tutorials](../)

---

**Last Updated:** December 3, 2025
**Maintained By:** Ahmed Abdelhaleem
**Source:** Legacy YAML Tutorial - Migrated to satellite repository infrastructure
