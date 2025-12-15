'use client';

import { Grid, Column } from '@carbon/react';
import LoginForm from './components/LoginForm';

export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#ffffff' // Ensure white background per Carbon White theme
    }}>
      {/* Carbon Grid wrapper to maintain alignment rules 
        We use a single column centered via flexbox on the parent 
      */}
      <Grid fullWidth>
        <Column lg={{ span: 4, offset: 6 }} md={{ span: 4, offset: 2 }} sm={4}>
          <div style={{ padding: '2rem 0' }}>
            <LoginForm />
          </div>
        </Column>
      </Grid>
    </main>
  );
}