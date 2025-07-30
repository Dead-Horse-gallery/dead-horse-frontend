// Example usage of ProtectedRoute component for Dead Horse Gallery

import ProtectedRoute from '@/components/ProtectedRoute';

// Example 1: Protected page with modal login
export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>
        <p>This page requires authentication. Users will see a login modal if not authenticated.</p>
      </div>
    </ProtectedRoute>
  );
}

// Example 2: Protected page with redirect to login page
export function DashboardPage() {
  return (
    <ProtectedRoute 
      requireAuth={true}
      showModal={false}
      redirectTo="/login"
    >
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p>This page redirects to /login if user is not authenticated.</p>
      </div>
    </ProtectedRoute>
  );
}

// Example 3: Optional authentication (public page that shows different content when authenticated)
export function GalleryPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Gallery</h1>
        <p>This page is public but may show different content based on authentication status.</p>
      </div>
    </ProtectedRoute>
  );
}

// Example 4: Custom handling when not authenticated
export function PurchasePage() {
  return (
    <ProtectedRoute 
      requireAuth={true}
      showModal={true}
    >
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Purchase Artwork</h1>
        <p>Authentication required to make purchases. Login modal will appear if needed.</p>
      </div>
    </ProtectedRoute>
  );
}
