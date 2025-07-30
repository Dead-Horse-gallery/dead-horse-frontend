# Component Cleanup Plan - Dead Horse Gallery

## Overview

This document outlines the plan to consolidate test, demo, and example components to reduce bundle size and improve maintainability.

## Components to Consolidate

### 1. Demo Components
**Current State:**
- `AuthDemo.tsx` - Authentication system demonstration
- `DeadHorseDemo.tsx` - Overall application demo
- `ProtectedRoute.example.tsx` - Example usage of ProtectedRoute

**Consolidation Plan:**
- Merge into single `DemoShowcase.tsx` component
- Use tab-based interface to show different demos
- Add toggle for development mode only

### 2. Research Flow Components
**Current State:**
- `ArtistResearchFlow.tsx` - Artist onboarding flow
- `CollectorResearchFlow.tsx` - Collector onboarding flow  
- `CuriousResearchFlow.tsx` - General visitor flow
- `ResearchHomepage.tsx` - Research landing page
- `ResearchSurvey.tsx` - Survey component
- `ResearchThankYou.tsx` - Thank you page

**Consolidation Plan:**
- Create unified `ResearchFlow.tsx` component
- Use role-based routing instead of separate components
- Consolidate shared survey logic

### 3. Accessibility Components
**Current State:**
- `AccessibilityPanel.tsx` - Accessibility controls
- `AccessibleButton.tsx` - Accessible button wrapper
- `AccessibleImage.tsx` - Accessible image component
- `AccessibleInput.tsx` - Accessible input wrapper
- `AccessibleModal.tsx` - Accessible modal
- `AccessibleNavigation.tsx` - Accessible navigation

**Consolidation Plan:**
- Keep individual components (they're reusable)
- Create `AccessibilityProvider.tsx` context
- Add unified accessibility configuration

## Implementation Plan

### Phase 1: Demo Consolidation

Create consolidated demo component:

```typescript
// src/components/DemoShowcase.tsx
interface DemoShowcaseProps {
  enableInProduction?: boolean;
}

export function DemoShowcase({ enableInProduction = false }: DemoShowcaseProps) {
  // Only show in development unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !enableInProduction) {
    return null;
  }

  const [activeTab, setActiveTab] = useState('auth');

  return (
    <div className="demo-showcase">
      <div className="demo-tabs">
        <button onClick={() => setActiveTab('auth')}>Auth Demo</button>
        <button onClick={() => setActiveTab('protected')}>Protected Routes</button>
        <button onClick={() => setActiveTab('gallery')}>Gallery Demo</button>
      </div>
      
      <div className="demo-content">
        {activeTab === 'auth' && <AuthDemoContent />}
        {activeTab === 'protected' && <ProtectedRouteDemoContent />}
        {activeTab === 'gallery' && <GalleryDemoContent />}
      </div>
    </div>
  );
}
```

### Phase 2: Research Flow Consolidation

Create unified research flow:

```typescript
// src/components/ResearchFlow.tsx
interface ResearchFlowProps {
  userRole: 'artist' | 'collector' | 'curious';
  onComplete: (data: ResearchData) => void;
}

export function ResearchFlow({ userRole, onComplete }: ResearchFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<ResearchData>({});

  const flowConfig = getFlowConfig(userRole);

  return (
    <div className="research-flow">
      <ProgressIndicator current={currentStep} total={flowConfig.steps.length} />
      
      <StepRenderer
        step={flowConfig.steps[currentStep]}
        responses={responses}
        onNext={(stepData) => {
          setResponses(prev => ({ ...prev, ...stepData }));
          if (currentStep < flowConfig.steps.length - 1) {
            setCurrentStep(prev => prev + 1);
          } else {
            onComplete(responses);
          }
        }}
      />
    </div>
  );
}
```

### Phase 3: Bundle Optimization

Update imports to use consolidated components:

```typescript
// Before
import { AuthDemo } from '@/components/AuthDemo';
import { DeadHorseDemo } from '@/components/DeadHorseDemo';
import { ProtectedRouteExample } from '@/components/ProtectedRoute.example';

// After  
import { DemoShowcase } from '@/components/DemoShowcase';
```

## Bundle Size Impact

### Current Bundle Sizes (Estimated)
- AuthDemo.tsx: ~15KB
- DeadHorseDemo.tsx: ~25KB
- ProtectedRoute.example.tsx: ~8KB
- Research Flow Components: ~45KB
- **Total Demo Components: ~93KB**

### After Consolidation (Estimated)
- DemoShowcase.tsx: ~20KB (tree-shaken)
- ResearchFlow.tsx: ~30KB (unified logic)
- **Total Consolidated: ~50KB**
- **Savings: ~43KB (~46% reduction)**

## Code Quality Benefits

### 1. Reduced Duplication
- Shared authentication demo logic
- Unified error handling patterns
- Consistent styling and UX

### 2. Better Maintainability
- Single source of truth for demo functionality
- Easier to update and test
- Consistent API patterns

### 3. Improved Developer Experience
- Easier to find and use demo components
- Better documentation and examples
- Clearer separation of concerns

## Migration Steps

### 1. Create Consolidated Components
```bash
# Create new consolidated components
touch src/components/DemoShowcase.tsx
touch src/components/ResearchFlow.tsx
touch src/components/AccessibilityProvider.tsx
```

### 2. Update Imports
```bash
# Update all imports to use new components
find src -name "*.tsx" -exec sed -i 's/AuthDemo/DemoShowcase/g' {} +
find src -name "*.tsx" -exec sed -i 's/DeadHorseDemo/DemoShowcase/g' {} +
```

### 3. Remove Old Components
```bash
# After migration is complete and tested
rm src/components/AuthDemo.tsx
rm src/components/DeadHorseDemo.tsx
rm src/components/ProtectedRoute.example.tsx
```

### 4. Update Documentation
- Update component documentation
- Add migration guide for developers
- Update examples in README

## Testing Strategy

### 1. Component Testing
- Test consolidated components with all demo variations
- Ensure all original functionality is preserved
- Test tree-shaking effectiveness

### 2. Integration Testing
- Test demo flows end-to-end
- Verify accessibility is maintained
- Test performance impact

### 3. Bundle Analysis
```bash
# Before consolidation
npm run analyze

# After consolidation  
npm run analyze

# Compare bundle sizes
```

## Rollback Plan

If issues arise during consolidation:

1. **Keep Original Components**: Don't delete until consolidation is proven
2. **Feature Flags**: Use environment variables to toggle between old/new
3. **Gradual Migration**: Migrate one component at a time
4. **Monitoring**: Watch for any performance or functionality regressions

## Timeline

- **Week 1**: Create DemoShowcase component and migrate auth demo
- **Week 2**: Create ResearchFlow component and migrate research flows  
- **Week 3**: Testing and optimization
- **Week 4**: Remove old components and finalize documentation

This consolidation will significantly reduce bundle size while improving code maintainability and developer experience.
