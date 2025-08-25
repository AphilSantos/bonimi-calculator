# Development Journals - Bonimi Calculator App

## Calculator Builder Development Journey

### Issue 1: Shopify App Bridge v4 Migration Problems
**Date:** August 2025  
**Problem:** The app was initially built for App Bridge v3 but needed migration to v4.

**Key Learnings:**
- `Provider` component was removed in App Bridge v4 - replaced with `createApp` and `useAppBridgeContext`
- `authenticatedFetch` was deprecated - needed to switch to standard `fetch` API
- `NavMenu` component from `@shopify/app-bridge-react` no longer supports `navigationLinks` prop

**Solution:** Created custom `AppBridgeProvider` component that handles both real App Bridge instances and mock instances for local development.

### Issue 2: Polaris UI Component Deprecations
**Date:** August 2025  
**Problem:** Multiple Polaris components were showing deprecation warnings.

**Key Learnings:**
- `<Stack />` component was deprecated - replaced with `<VerticalStack />`
- `<Card />` component was deprecated - replaced with `<LegacyCard />`
- Polaris `Navigation` component requires a `<Frame>` wrapper context

**Solution:** Updated all deprecated components and created a custom navigation component using Polaris `Button` components to avoid `Frame` context requirements.

### Issue 3: App Bridge Configuration for Local Development
**Date:** August 2025  
**Problem:** App was failing with `APP::ERROR::INVALID_CONFIG: host must be provided` during local development.

**Root Cause:** 
- The `shopify-api-key` meta tag contained a placeholder (`%VITE_SHOPIFY_API_KEY%`) that wasn't being resolved
- The `host` parameter was missing from the URL during local development
- App Bridge requires both `apiKey` and `host` to initialize properly

**Solution:**
- Updated `AppBridgeProvider` to create a mock App Bridge instance when proper configuration is missing
- Hardcoded the actual `client_id` from `shopify.app.toml` into the meta tag
- Added fallback logic to prevent app crashes during local development

### Issue 4: Calculator Builder Elements Not Rendering
**Date:** August 2025  
**Problem:** The Calculator Builder was showing a blank Elements panel despite having data.

**Root Cause:** The Polaris `Tabs` component was expecting numerical indices (0, 1, 2) but the state was initialized with string values ('elements', 'properties').

**Key Learnings:**
- Polaris `Tabs` component's `selected` prop expects numerical values, not strings
- The `id` field in tab definitions must match the data type expected by the `selected` prop
- Console logging is crucial for debugging React rendering issues

**Solution:** 
- Changed tab state from strings to numbers: `useState(0)` instead of `useState('elements')`
- Updated tab IDs to use numbers: `{ id: 0, content: 'Elements' }`
- Updated all conditional rendering to use numerical comparisons: `leftActiveTab === 0`

### Issue 5: Drag and Drop Functionality
**Date:** August 2025  
**Problem:** Elements were visible but drag and drop wasn't working.

**Key Learnings:**
- HTML5 drag and drop requires proper event handling: `onDragStart`, `onDragOver`, `onDrop`
- `draggable` attribute must be set on draggable elements
- `dataTransfer.setData()` and `dataTransfer.getData()` are essential for passing element data
- Position calculation for dropped elements needs to account for canvas offset

**Solution:** Implemented proper drag and drop handlers with position calculation based on drop coordinates.

### Issue 6: State Management Complexity
**Date:** August 2025  
**Problem:** Managing multiple tab states and element configurations became complex.

**Key Learnings:**
- Separate state variables for different UI sections: `leftActiveTab` and `rightActiveTab`
- Element configuration changes need to update the correct element in the canvas
- State updates should be immutable and use functional updates when possible

**Solution:** 
- Separated tab state management for left and right sidebars
- Implemented `handleElementConfigChange` function that updates specific elements
- Used functional state updates to ensure proper React re-rendering

### Issue 7: Formula Evaluation Engine
**Date:** August 2025  
**Problem:** Custom calculator formulas were throwing syntax errors during evaluation.

**Key Learnings:**
- JavaScript `eval()` function can be dangerous and may not handle all formula syntax
- `new Function()` constructor provides safer alternative for dynamic code execution
- Formula validation is crucial to prevent runtime errors
- Variable substitution needs proper sanitization

**Solution:** Implemented `evaluateFormula` function using `new Function()` with proper error handling and validation.

## General Development Insights

### React Development Best Practices
1. **Console Logging for Debugging:** Extensive use of `console.log` helped identify rendering issues
2. **State Management:** Separate state variables for different UI concerns improve maintainability
3. **Component Composition:** Breaking complex UI into smaller, focused components
4. **Error Boundaries:** Implementing try-catch blocks in render functions prevents crashes

### Shopify App Development Insights
1. **Local Development Challenges:** App Bridge configuration differs between local and production
2. **Meta Tag Management:** Environment variables in meta tags need proper build-time resolution
3. **Navigation Patterns:** Custom navigation components may be more reliable than complex Polaris components
4. **Mock Services:** Fallback implementations are essential for development workflow

### UI/UX Design Considerations
1. **Drag and Drop Interface:** Visual feedback and clear drop zones improve user experience
2. **Tab Organization:** Logical grouping of related functionality (Elements/Properties, Formula/Products/Advanced)
3. **Canvas Design:** Grid patterns and dashed borders provide clear visual cues
4. **Element Configuration:** Properties panel should update in real-time as elements are modified

### Performance Considerations
1. **Rendering Optimization:** Avoid unnecessary re-renders by using proper state management
2. **Event Handling:** Debounce or throttle expensive operations like formula evaluation
3. **Memory Management:** Clean up event listeners and references to prevent memory leaks

## Next Steps and Recommendations

### Immediate Improvements
1. **Element Icons:** Add proper icons for each element type using Polaris icon library
2. **Formula Validation:** Implement real-time formula syntax checking
3. **Element Positioning:** Add grid snapping and better positioning logic
4. **Undo/Redo:** Implement undo/redo functionality for element operations

### Future Enhancements
1. **Template System:** Pre-built calculator templates for common use cases
2. **Export/Import:** Save and load calculator configurations
3. **Preview Mode:** Real-time preview of how the calculator will look to customers
4. **Integration:** Connect with Shopify product catalog for real product data

### Testing Strategy
1. **Unit Tests:** Test individual functions like `evaluateFormula` and `handleElementConfigChange`
2. **Integration Tests:** Test drag and drop functionality and state management
3. **User Testing:** Validate the interface with actual users building calculators
4. **Cross-browser Testing:** Ensure compatibility across different browsers

---

**Note:** This journal documents the development journey of the Calculator Builder feature. Each issue represents a significant learning opportunity and should be referenced when implementing similar features in the future.
