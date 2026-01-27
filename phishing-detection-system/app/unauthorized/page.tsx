'use client'

import React from 'react'
import { Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-red-500/10 rounded-full">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Access Denied
        </h1>
        
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this resource. 
          Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => router.back()} 
            className="w-full"
            variant="outline"
          >
            Go Back
          </Button>
          
          <Button 
            onClick={() => router.push('/')} 
            className="w-full"
          >
            Return Home
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Security Notice</span>
          </div>
          <p className="text-xs text-muted-foreground">
            This action has been logged for security purposes.
          </p>
        </div>
      </div>
    </div>
  )
}
