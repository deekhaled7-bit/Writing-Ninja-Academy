'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [emailSettings, setEmailSettings] = useState({
    enableVerificationEmails: true,
    enableWelcomeEmails: true,
    adminEmail: 'admin@example.com',
  });

  const [siteSettings, setSiteSettings] = useState({
    siteName: 'The Writing Ninjas Academy',
    siteDescription: 'A kid-friendly platform for young writers to share their stories and discover amazing tales from fellow ninjas.',
    allowPublicRegistration: true,
    requireEmailVerification: true,
  });

  const handleEmailSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would save these settings to your backend
    toast({
      title: 'Email settings saved',
      description: 'Your email settings have been updated successfully.',
    });
  };

  const handleSiteSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would save these settings to your backend
    toast({
      title: 'Site settings saved',
      description: 'Your site settings have been updated successfully.',
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      
      <Tabs defaultValue="site">
        <TabsList className="mb-4">
          <TabsTrigger value="site">Site Settings</TabsTrigger>
          <TabsTrigger value="email">Email Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
              <CardDescription>
                Manage your site settings and configurations.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSiteSettingsSave}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={siteSettings.siteDescription}
                    onChange={(e) => setSiteSettings({...siteSettings, siteDescription: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowPublicRegistration"
                    checked={siteSettings.allowPublicRegistration}
                    onCheckedChange={(checked) => 
                      setSiteSettings({...siteSettings, allowPublicRegistration: checked as boolean})
                    }
                  />
                  <Label htmlFor="allowPublicRegistration">Allow public registration</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requireEmailVerification"
                    checked={siteSettings.requireEmailVerification}
                    onCheckedChange={(checked) => 
                      setSiteSettings({...siteSettings, requireEmailVerification: checked as boolean})
                    }
                  />
                  <Label htmlFor="requireEmailVerification">Require email verification</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure email notifications and settings.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleEmailSettingsSave}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={emailSettings.adminEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, adminEmail: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableVerificationEmails"
                    checked={emailSettings.enableVerificationEmails}
                    onCheckedChange={(checked) => 
                      setEmailSettings({...emailSettings, enableVerificationEmails: checked as boolean})
                    }
                  />
                  <Label htmlFor="enableVerificationEmails">Enable verification emails</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableWelcomeEmails"
                    checked={emailSettings.enableWelcomeEmails}
                    onCheckedChange={(checked) => 
                      setEmailSettings({...emailSettings, enableWelcomeEmails: checked as boolean})
                    }
                  />
                  <Label htmlFor="enableWelcomeEmails">Enable welcome emails</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}