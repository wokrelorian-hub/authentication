'use client';

import { Suspense } from 'react';
import { Grid, Column, Loading } from '@carbon/react';
import LoginForm from './components/LoginForm';

export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#ffffff' 
    }}>
      <Grid fullWidth>
        <Column lg={{ span: 4, offset: 6 }} md={{ span: 4, offset: 2 }} sm={4}>
          <div style={{ padding: '2rem 0' }}>
            
            {/* FIX: Use the actual Carbon 'Loading' component here */}
            <Suspense fallback={
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Loading withOverlay={false} description="Loading authentication..." />
              </div>
            }>
              <LoginForm />
            </Suspense>

          </div>
        </Column>
      </Grid>
    </main>
  );
}