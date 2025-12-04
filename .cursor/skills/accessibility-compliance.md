# Accessibility Compliance Skill

> **Purpose:** Building inclusive applications that work for users with disabilities, following WCAG guidelines and platform-specific accessibility features.

---

## 1. Accessibility Fundamentals

### The POUR Principles (WCAG)
```
P - Perceivable:    Can users perceive the content?
O - Operable:       Can users interact with all controls?
U - Understandable: Can users understand the content and interface?
R - Robust:         Does it work with assistive technologies?
```

### React Native Accessibility Properties
| Property | Purpose | Example |
| :--- | :--- | :--- |
| `accessible` | Marks element as accessible | `accessible={true}` |
| `accessibilityLabel` | Screen reader text | `accessibilityLabel="Submit form"` |
| `accessibilityHint` | Additional context | `accessibilityHint="Submits your registration"` |
| `accessibilityRole` | Semantic role | `accessibilityRole="button"` |
| `accessibilityState` | Current state | `accessibilityState={{ disabled: true }}` |
| `accessibilityValue` | Value for sliders/progress | `accessibilityValue={{ min: 0, max: 100, now: 50 }}` |

---

## 2. Semantic Roles

### Available Roles
```typescript
type AccessibilityRole =
  | 'none'           // Decorative, skip
  | 'button'         // Clickable action
  | 'link'           // Navigation link
  | 'search'         // Search input
  | 'image'          // Image content
  | 'imagebutton'    // Clickable image
  | 'text'           // Static text
  | 'adjustable'     // Slider, stepper
  | 'header'         // Section header
  | 'summary'        // Summary of content
  | 'alert'          // Important notification
  | 'checkbox'       // Toggle option
  | 'combobox'       // Dropdown
  | 'menu'           // Menu container
  | 'menubar'        // Menu bar
  | 'menuitem'       // Menu option
  | 'progressbar'    // Loading indicator
  | 'radio'          // Radio option
  | 'radiogroup'     // Radio group
  | 'scrollbar'      // Scroll indicator
  | 'spinbutton'     // Number input
  | 'switch'         // On/off toggle
  | 'tab'            // Tab button
  | 'tablist'        // Tab container
  | 'timer'          // Time display
  | 'toolbar'        // Action toolbar
```

### Role Usage Examples
```typescript
// Button
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Add to cart"
  accessibilityHint="Adds this item to your shopping cart"
>
  <Text>Add to Cart</Text>
</TouchableOpacity>

// Link
<TouchableOpacity
  accessibilityRole="link"
  accessibilityLabel="Read more about our privacy policy"
>
  <Text>Privacy Policy</Text>
</TouchableOpacity>

// Header
<Text
  accessibilityRole="header"
  style={styles.sectionTitle}
>
  Account Settings
</Text>

// Switch
<Switch
  accessibilityRole="switch"
  accessibilityLabel="Enable notifications"
  accessibilityState={{ checked: isEnabled }}
/>
```

---

## 3. Labels and Descriptions

### Writing Effective Labels
```typescript
// ❌ BAD: Icon-only button without label
<TouchableOpacity onPress={onDelete}>
  <Ionicons name="trash" size={24} />
</TouchableOpacity>

// ✅ GOOD: Descriptive label
<TouchableOpacity
  onPress={onDelete}
  accessibilityRole="button"
  accessibilityLabel="Delete item"
  accessibilityHint="Removes this item from your list permanently"
>
  <Ionicons name="trash" size={24} accessibilityElementsHidden />
</TouchableOpacity>
```

### Label Best Practices
```
✅ DO:
- Be concise but descriptive: "Submit order" not "Button"
- Describe the action: "Play video" not "Video"
- Include state: "Play video, paused" or use accessibilityState
- Use sentence case: "Add to favorites" not "ADD TO FAVORITES"

❌ DON'T:
- Include "button" in label (role handles this)
- Use "Click here" or "Tap to..."
- Be overly verbose
- Duplicate visible text unnecessarily
```

### Dynamic Labels
```typescript
// Label changes based on state
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
  accessibilityState={{ selected: isFavorite }}
>
  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} />
</TouchableOpacity>

// Label with count
<View
  accessibilityRole="button"
  accessibilityLabel={`Shopping cart, ${itemCount} items`}
>
  <Ionicons name="cart" />
  <Badge count={itemCount} />
</View>
```

---

## 4. Focus Management

### Focus Order
```typescript
// Group related elements
<View accessible={true} accessibilityLabel="User profile section">
  <Image source={avatar} accessibilityElementsHidden />
  <Text>{userName}</Text>
  <Text>{userBio}</Text>
</View>

// Custom focus order (iOS)
<View accessibilityViewIsModal={true}>
  {/* Modal content gets focus priority */}
</View>
```

### Focus Announcements
```typescript
import { AccessibilityInfo } from 'react-native'

// Announce dynamic changes
const announceMessage = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message)
}

// Usage: After form submission
const handleSubmit = async (): Promise<void> => {
  await submitForm()
  announceMessage('Form submitted successfully')
}

// Usage: After error
const handleError = (error: Error): void => {
  announceMessage(`Error: ${error.message}`)
}
```

### Focus Trapping in Modals
```typescript
// Modal with proper focus management
<Modal
  visible={isVisible}
  onRequestClose={onClose}
  accessibilityViewIsModal={true}
>
  <View
    accessible={true}
    accessibilityLabel="Dialog"
    accessibilityRole="alert"
  >
    <Text accessibilityRole="header">Confirm Action</Text>
    <Text>Are you sure you want to proceed?</Text>
    <Button title="Cancel" onPress={onClose} />
    <Button title="Confirm" onPress={onConfirm} />
  </View>
</Modal>
```

---

## 5. Color and Contrast

### Minimum Contrast Ratios (WCAG AA)
```
Normal text (<18px):     4.5:1 contrast ratio
Large text (≥18px bold): 3:1 contrast ratio
UI components:           3:1 contrast ratio
```

### Color Usage Rules
```typescript
// ❌ BAD: Color alone conveys meaning
<Text style={{ color: 'red' }}>Error occurred</Text>

// ✅ GOOD: Color + icon + text
<View style={styles.errorContainer}>
  <Ionicons name="alert-circle" color={theme.colors.error} />
  <Text style={styles.errorText}>Error: Invalid email format</Text>
</View>

// ❌ BAD: Low contrast
const badStyles = {
  text: { color: '#888888', backgroundColor: '#FFFFFF' } // 3.5:1 - fails
}

// ✅ GOOD: Sufficient contrast
const goodStyles = {
  text: { color: '#595959', backgroundColor: '#FFFFFF' } // 7:1 - passes AA
}
```

### Dark Mode Support
```typescript
import { useColorScheme } from 'react-native'

const colors = {
  light: {
    background: '#FFFFFF',
    text: '#111827',        // Contrast: 17.4:1
    textSecondary: '#4B5563' // Contrast: 7.5:1
  },
  dark: {
    background: '#111827',
    text: '#F9FAFB',        // Contrast: 17.4:1
    textSecondary: '#9CA3AF' // Contrast: 7.2:1
  }
}

const useThemeColors = () => {
  const scheme = useColorScheme()
  return colors[scheme ?? 'light']
}
```

---

## 6. Touch Targets

### Minimum Touch Target Sizes
```typescript
// WCAG 2.1 Success Criterion 2.5.5: Minimum 44x44 points

const styles = StyleSheet.create({
  // ✅ GOOD: Adequate touch target
  touchable: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  // For smaller visual elements, expand hitSlop
  smallButton: {
    width: 24,
    height: 24
  }
})

// Use hitSlop for small visual elements
<TouchableOpacity
  style={styles.smallButton}
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  accessibilityLabel="Close"
>
  <Ionicons name="close" size={24} />
</TouchableOpacity>
```

### Spacing Between Targets
```typescript
// Minimum 8px spacing between touch targets
const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    gap: 12 // Safe spacing between buttons
  }
})
```

---

## 7. Text and Typography

### Scalable Text
```typescript
import { Text, PixelRatio } from 'react-native'

// ✅ GOOD: Allow system font scaling
<Text
  style={styles.body}
  allowFontScaling={true}
  maxFontSizeMultiplier={2} // Cap at 2x for layout stability
>
  Body text that scales with system settings
</Text>

// Test with different font scales
// iOS: Settings → Accessibility → Display & Text Size
// Android: Settings → Accessibility → Font size
```

### Text Accessibility
```typescript
// Line height for readability
const typography = {
  body: {
    fontSize: 16,
    lineHeight: 24, // 1.5x font size minimum
    letterSpacing: 0.5
  },
  small: {
    fontSize: 14,
    lineHeight: 21
  }
}

// Avoid ALL CAPS for long text (harder to read)
// Use textTransform sparingly
<Text style={{ textTransform: 'uppercase' }}>
  {shortLabel} {/* OK for short labels */}
</Text>
```

---

## 8. Forms and Inputs

### Accessible Form Pattern
```typescript
// Complete accessible form field
<View>
  {/* Label */}
  <Text
    nativeID="email-label"
    style={styles.label}
  >
    Email Address
  </Text>
  
  {/* Input */}
  <TextInput
    accessibilityLabel="Email Address"
    accessibilityLabelledBy="email-label"
    accessibilityHint="Enter your email address"
    accessibilityState={{
      disabled: isDisabled,
      invalid: hasError
    }}
    keyboardType="email-address"
    autoComplete="email"
    textContentType="emailAddress"
    autoCapitalize="none"
  />
  
  {/* Error message */}
  {hasError && (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.errorText}
    >
      {errorMessage}
    </Text>
  )}
</View>
```

### Error Handling
```typescript
// Announce errors to screen readers
const FormField = ({ error, ...props }: FormFieldProps): JSX.Element => {
  useEffect(() => {
    if (error) {
      AccessibilityInfo.announceForAccessibility(`Error: ${error}`)
    }
  }, [error])

  return (
    <View>
      <TextInput {...props} accessibilityState={{ invalid: !!error }} />
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  )
}
```

---

## 9. Motion and Animation

### Respect Reduce Motion
```typescript
import { AccessibilityInfo } from 'react-native'
import { useEffect, useState } from 'react'

const useReducedMotion = (): boolean => {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    )
    
    return () => subscription.remove()
  }, [])

  return reduceMotion
}

// Usage
const AnimatedComponent = (): JSX.Element => {
  const reduceMotion = useReducedMotion()
  
  const animationDuration = reduceMotion ? 0 : 300
  
  return (
    <Animated.View
      style={{
        transform: [{
          translateX: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 100]
          })
        }]
      }}
    />
  )
}
```

### Safe Animation Patterns
```typescript
// ✅ GOOD: Subtle, non-essential animations
// - Fade transitions
// - Scale on press
// - Progress indicators

// ❌ AVOID: Problematic animations
// - Flashing content (>3 flashes/second can trigger seizures)
// - Large movement animations without reduce motion support
// - Auto-playing videos without controls
```

---

## 10. Testing Accessibility

### Manual Testing Checklist
```
iOS VoiceOver:
□ Triple-click home/side button to enable
□ Navigate through all interactive elements
□ Verify labels are read correctly
□ Test with different gestures

Android TalkBack:
□ Enable in Settings → Accessibility
□ Verify focus order makes sense
□ Test all touch targets
□ Check contrast in high contrast mode

General:
□ Test with largest font size
□ Test with reduced motion enabled
□ Test with inverted colors
□ Verify without sound (visual feedback)
```

### Automated Testing
```typescript
// Jest + Testing Library accessibility checks
import { render } from '@testing-library/react-native'

describe('Button Accessibility', () => {
  it('has accessible role and label', () => {
    const { getByRole, getByLabelText } = render(
      <Button title="Submit" onPress={() => {}} />
    )
    
    expect(getByRole('button')).toBeTruthy()
    expect(getByLabelText('Submit')).toBeTruthy()
  })

  it('indicates disabled state', () => {
    const { getByRole } = render(
      <Button title="Submit" onPress={() => {}} disabled />
    )
    
    expect(getByRole('button').props.accessibilityState.disabled).toBe(true)
  })
})
```

---

## 11. Accessibility Checklist for Components

### Before Shipping Any Component
```
□ Has appropriate accessibilityRole
□ Has descriptive accessibilityLabel (if visual content)
□ Has accessibilityHint for non-obvious actions
□ Communicates state (disabled, selected, checked, expanded)
□ Touch target is at least 44x44 points
□ Color is not the only indicator of meaning
□ Text has sufficient contrast (4.5:1 minimum)
□ Supports dynamic type / font scaling
□ Works with screen reader
□ Works with keyboard (if applicable)
□ Respects reduced motion preference
```

---

## 12. Anti-Patterns

| ❌ Avoid | ✅ Correct Approach |
| :--- | :--- |
| Icon buttons without labels | Add `accessibilityLabel` |
| `accessible={false}` on interactive elements | Keep accessible by default |
| Color-only error indication | Add icon + text + role="alert" |
| Small touch targets (<44px) | Minimum 44x44 or use hitSlop |
| `accessibilityLabel="button"` | Describe the action, not the element type |
| Auto-playing animations | Support prefers-reduced-motion |
| Inaccessible custom components | Build on accessible primitives |
| Missing form labels | Always associate labels with inputs |
| Low contrast text | Maintain 4.5:1 minimum ratio |
| Timeout without warning | Warn users, allow extension |

