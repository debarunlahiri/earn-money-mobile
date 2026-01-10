# Migration Guide: Using EnhancedTouchable Component

## Overview

The `EnhancedTouchable` component is a drop-in replacement for `TouchableOpacity` that automatically includes fixes for touch issues on ColorOS/FuntouchOS devices (Realme, Oppo, Vivo).

## Quick Start

### Import the Component

```tsx
import {EnhancedTouchable} from '../components/EnhancedTouchable';
```

### Basic Usage

Replace your existing `TouchableOpacity`:

**Before:**

```tsx
<TouchableOpacity onPress={handlePress}>
  <Text>Click me</Text>
</TouchableOpacity>
```

**After:**

```tsx
<EnhancedTouchable onPress={handlePress}>
  <Text>Click me</Text>
</EnhancedTouchable>
```

## Usage Examples

### 1. List Items (Small Hit Slop)

```tsx
<EnhancedTouchable onPress={() => handleItemPress(item.id)} hitSlopSize="small">
  <View style={styles.listItem}>
    <Text>{item.name}</Text>
  </View>
</EnhancedTouchable>
```

### 2. Regular Buttons (Medium Hit Slop - Default)

```tsx
<EnhancedTouchable
  onPress={handleSubmit}
  activeOpacity={0.7}
  style={styles.button}>
  <Text style={styles.buttonText}>Submit</Text>
</EnhancedTouchable>
```

### 3. FAB or Important Buttons (Large Hit Slop)

```tsx
<EnhancedTouchable
  onPress={handleAddNew}
  hitSlopSize="large"
  style={styles.fab}>
  <Icon name="add" size={24} color="#FFF" />
</EnhancedTouchable>
```

### 4. Custom Hit Slop

```tsx
<EnhancedTouchable
  onPress={handlePress}
  customHitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
  <Text>Custom touch area</Text>
</EnhancedTouchable>
```

### 5. With All TouchableOpacity Props

```tsx
<EnhancedTouchable
  onPress={handlePress}
  activeOpacity={0.8}
  disabled={isLoading}
  style={styles.container}
  onLongPress={handleLongPress}>
  <View>
    <Text>Press or long press me</Text>
  </View>
</EnhancedTouchable>
```

## Migration Steps

### Step 1: Update Imports

In each file that uses `TouchableOpacity`, add the import:

```tsx
import {EnhancedTouchable} from '../components/EnhancedTouchable';
// or adjust the path based on your file location
```

### Step 2: Replace TouchableOpacity

Use find and replace in your editor:

- Find: `<TouchableOpacity`
- Replace: `<EnhancedTouchable`

And:

- Find: `</TouchableOpacity>`
- Replace: `</EnhancedTouchable>`

### Step 3: Add Hit Slop Size (Optional)

Based on the component type, add the appropriate `hitSlopSize`:

```tsx
// For list items
<EnhancedTouchable hitSlopSize="small" onPress={...}>

// For regular buttons (default, can be omitted)
<EnhancedTouchable hitSlopSize="medium" onPress={...}>

// For FABs, important buttons
<EnhancedTouchable hitSlopSize="large" onPress={...}>
```

### Step 4: Remove Manual Fixes

If you've already added `collapsable={false}` or `hitSlop` manually, you can remove them:

**Before:**

```tsx
<TouchableOpacity
  onPress={handlePress}
  collapsable={false}
  hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
  <Text>Click me</Text>
</TouchableOpacity>
```

**After:**

```tsx
<EnhancedTouchable onPress={handlePress}>
  <Text>Click me</Text>
</EnhancedTouchable>
```

## When to Use Each Hit Slop Size

### Small (`hitSlopSize="small"`)

- List items in scrollable lists
- Picker items in dropdowns
- Dense UI elements
- **Hit Slop:** `{top: 2, bottom: 2, left: 2, right: 2}`

### Medium (default)

- Regular buttons
- Card components
- Dropdown triggers
- Navigation items
- **Hit Slop:** `{top: 5, bottom: 5, left: 5, right: 5}`

### Large (`hitSlopSize="large"`)

- Floating Action Buttons (FAB)
- Back buttons
- Close buttons
- Primary action buttons
- **Hit Slop:** `{top: 10, bottom: 10, left: 10, right: 10}`

## Component API

### Props

| Prop                       | Type                             | Default    | Description                                    |
| -------------------------- | -------------------------------- | ---------- | ---------------------------------------------- |
| `hitSlopSize`              | `'small' \| 'medium' \| 'large'` | `'medium'` | Predefined hit slop size                       |
| `customHitSlop`            | `{top, bottom, left, right}`     | -          | Custom hit slop values (overrides hitSlopSize) |
| All TouchableOpacity props | -                                | -          | Supports all standard TouchableOpacity props   |

### Automatic Features

- ✅ `collapsable={false}` - Always applied
- ✅ `hitSlop` - Applied based on size or custom value
- ✅ All TouchableOpacity props - Fully compatible

## Benefits

1. **Consistent Touch Behavior**

   - Works reliably on all Android devices
   - No more touch issues on ColorOS/FuntouchOS

2. **Cleaner Code**

   - No need to manually add `collapsable={false}` everywhere
   - Predefined hit slop sizes for common use cases

3. **Better Maintainability**

   - Single source of truth for touch fixes
   - Easy to update if requirements change

4. **Type Safety**
   - Full TypeScript support
   - Inherits all TouchableOpacity types

## Example: Migrating a Screen

**Before:**

```tsx
import {TouchableOpacity} from 'react-native';

export const MyScreen = () => {
  return (
    <View>
      <TouchableOpacity
        onPress={handleBack}
        collapsable={false}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Icon name="arrow-back" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        collapsable={false}
        hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};
```

**After:**

```tsx
import {EnhancedTouchable} from '../components/EnhancedTouchable';

export const MyScreen = () => {
  return (
    <View>
      <EnhancedTouchable onPress={handleBack} hitSlopSize="large">
        <Icon name="arrow-back" />
      </EnhancedTouchable>

      <EnhancedTouchable onPress={handleSubmit}>
        <Text>Submit</Text>
      </EnhancedTouchable>
    </View>
  );
};
```

## Recommended Migration Priority

1. **High Priority** (User-facing interactive elements)

   - Login/Register screens
   - Form submission buttons
   - Navigation buttons
   - FABs

2. **Medium Priority** (Frequently used features)

   - List items
   - Card components
   - Settings screens
   - Profile screens

3. **Low Priority** (Less critical)
   - Admin screens
   - Rarely used features

## Testing After Migration

After migrating to `EnhancedTouchable`, test on:

- ✅ Realme devices (ColorOS)
- ✅ Oppo devices (ColorOS)
- ✅ Vivo devices (FuntouchOS)
- ✅ Stock Android (regression)
- ✅ Samsung devices (regression)

## Troubleshooting

### Issue: Touch still not working

**Solution:** Check if there are overlapping views with higher z-index. Add `elevation` and `zIndex` to the parent container.

### Issue: Touch area too large

**Solution:** Use `hitSlopSize="small"` or set `customHitSlop` with smaller values.

### Issue: Touch area too small

**Solution:** Use `hitSlopSize="large"` or increase the visible size of the component.

## Future Improvements

Consider creating similar enhanced components for:

- `Pressable` (React Native's newer touchable component)
- `TouchableHighlight`
- `TouchableWithoutFeedback`

## Questions?

If you encounter any issues or have questions about using `EnhancedTouchable`, refer to:

- `DEVICE_COMPATIBILITY_FIX.md` - Technical details
- `TOUCH_ISSUE_FIX_SUMMARY.md` - Fix summary
- Component source code: `src/components/EnhancedTouchable.tsx`
