# Framer Motion Guidelines & Best Practices

## 🚫 **PROHIBITED PROPERTIES**

The following properties are **NOT supported** in Framer Motion animation props and will cause TypeScript errors:

### ❌ **NEVER USE in Motion Props:**
```typescript
// WRONG - These will cause TypeScript errors
whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
whileHover={{ y: -5, boxShadow: "..." }}
animate={{ shadow: "..." }}
initial={{ shadow: "..." }}
```

**Prohibited properties:**
- `shadow: "..."` ❌
- `boxShadow: "..."` ❌
- Any CSS property that should be handled by CSS classes

## ✅ **CORRECT USAGE**

### **For Animations (Motion Props):**
```typescript
// CORRECT - Use only transform and opacity properties
whileHover={{ y: -5, scale: 1.02, opacity: 0.8 }}
whileTap={{ scale: 0.95 }}
animate={{ opacity: 1, y: 0 }}
initial={{ opacity: 0, y: 20 }}
transition={{ duration: 0.3, type: "spring" }}
```

**Valid animation properties:**
- `x`, `y`, `z` - Position transforms
- `scale`, `scaleX`, `scaleY` - Scale transforms
- `rotate`, `rotateX`, `rotateY`, `rotateZ` - Rotation transforms
- `opacity` - Transparency
- `transition` - Animation timing
- Any valid CSS transform property

### **For Visual Effects (CSS Classes):**
```typescript
// CORRECT - Use Tailwind CSS classes for shadows
<motion.div
  className="shadow-xl hover:shadow-2xl transition-all duration-300"
  whileHover={{ y: -5, scale: 1.02 }}
>
  Content
</motion.div>
```

**Shadow classes to use:**
- `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`
- `hover:shadow-sm`, `hover:shadow`, `hover:shadow-md`, `hover:shadow-lg`, `hover:shadow-xl`, `hover:shadow-2xl`
- Add `transition-all duration-300` for smooth effects

## 📋 **CHECKLIST FOR NEW MOTION COMPONENTS**

Before committing any Framer Motion code, verify:

### ✅ **Motion Props Check:**
- [ ] No `shadow:` properties in `whileHover`
- [ ] No `boxShadow:` properties in `animate`
- [ ] No `shadow:` properties in `initial`
- [ ] Only using transform/opacity properties in motion props

### ✅ **CSS Classes Check:**
- [ ] Shadow effects use Tailwind classes (`shadow-xl`, `hover:shadow-2xl`)
- [ ] Transitions use `transition-all duration-300`
- [ ] Hover effects are in CSS classes, not motion props

### ✅ **Build Verification:**
- [ ] Run `npm run build` - should pass without TypeScript errors
- [ ] No "Object literal may only specify known properties" errors

## 🔧 **COMMON PATTERNS**

### **Card Hover Effect:**
```typescript
<motion.div
  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
  whileHover={{ y: -5, scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  Card content
</motion.div>
```

### **Button Hover Effect:**
```typescript
<motion.button
  className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Button text
</motion.button>
```

### **Fade In Animation:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="shadow-xl"
>
  Content
</motion.div>
```

## 🚨 **ERROR PREVENTION**

If you see this error:
```
"Object literal may only specify known properties, and 'shadow' does not exist in type 'TargetAndTransition'"
```

**Immediate Fix:**
1. Remove `shadow: "..."` from motion props
2. Add shadow effects to CSS classes
3. Test with `npm run build`

## 📚 **RESOURCES**

- [Framer Motion Valid Animation Properties](https://www.framer.com/motion/api/)
- [Tailwind CSS Shadow Classes](https://tailwindcss.com/docs/box-shadow)
- [CSS Transitions vs JavaScript Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions)

---

**Remember:** Motion props for animations, CSS classes for styling! 🎨✨
