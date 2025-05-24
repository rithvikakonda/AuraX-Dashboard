import React, { useState } from 'react'
import BasicAdjustments from './right_components/basic_adjustments'
import Templates from './right_components/templates'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

const RightMenu = () => {
  const [activeTab, setActiveTab] = useState("adjustments")

  return (
    <div className="w-80 border-l bg-card h-full">
      <Tabs 
        defaultValue="adjustments" 
        value={activeTab}
        onValueChange={setActiveTab} 
        className="h-full flex flex-col"
      >
        <div className="px-4 py-2 border-b">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
        </div>
        
        <ScrollArea className="flex-1">
          <TabsContent value="adjustments" className="m-0 p-4">
            <Card className="border-none shadow-none">
              <CardContent className="p-0 pt-2">
                <BasicAdjustments />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates" className="m-0 p-4">
            <Card className="border-none shadow-none">
              <CardContent className="p-0 pt-2">
                <Templates />
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}

export default RightMenu
