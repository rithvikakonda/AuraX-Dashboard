import React from 'react'
import Brush from './left_components/brush'
import Effects from './left_components/effects'
import Filters from './left_components/filters'
import Overlays from './left_components/overlays'
import Stickers from './left_components/stickers'
import TextAnnotation from './left_components/text_annotation'
import Transform from './left_components/transform'
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setActiveFeature } from "@/redux/features/studioSlice";

import { 
  Paintbrush, 
  Sparkles, 
  SlidersHorizontal, 
  Sticker, 
  Type, 
  Move,
  Square
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type FeatureType = 'brush' | 'effects' | 'filters' | 'overlays' | 'stickers' | 'text' | 'transform' | null;

const LeftMenu = () => {
  const dispatch = useAppDispatch();
  const { activeFeature } = useAppSelector((state) => state.studio);
  
  // Feature configuration with icons and components
  const features = [
    { 
      id: 'transform' as FeatureType, 
      name: 'Transform', 
      icon: <Move className="h-5 w-5" />, 
      component: <Transform /> 
    },
    { 
      id: 'text' as FeatureType, 
      name: 'Text', 
      icon: <Type className="h-5 w-5" />, 
      component: <TextAnnotation /> 
    },
    { 
      id: 'filters' as FeatureType, 
      name: 'Filters', 
      icon: <SlidersHorizontal className="h-5 w-5" />, 
      component: <Filters /> 
    },
    { 
      id: 'effects' as FeatureType, 
      name: 'Effects', 
      icon: <Sparkles className="h-5 w-5" />, 
      component: <Effects /> 
    },
    { 
      id: 'overlays' as FeatureType, 
      name: 'Overlays', 
      icon: <Square className="h-5 w-5" />,
      component: <Overlays /> 
    },
    { 
      id: 'brush' as FeatureType, 
      name: 'Brush', 
      icon: <Paintbrush className="h-5 w-5" />, 
      component: <Brush /> 
    },
    { 
      id: 'stickers' as FeatureType, 
      name: 'Stickers', 
      icon: <Sticker className="h-5 w-5" />, 
      component: <Stickers /> 
    },
  ];
  
  return (
    <div className="flex h-full">
      {/* Icons sidebar */}
      <div className="w-14 border-r bg-muted/40 flex flex-col gap-7 items-center py-4">
        <TooltipProvider>
          {features.map((feature) => (
            <Tooltip key={feature.id} delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeFeature === feature.id ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => dispatch(setActiveFeature(feature.id!))}
                  className="h-12 w-12"
                >
                  {feature.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{feature.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Feature panel */}
      {activeFeature && (
        <Card className="w-64 border-0 rounded-none shadow-none h-full">
          <CardHeader className="px-3">
            <CardTitle className="text-base font-bold text-center uppercase">
              {features.find(f => f.id === activeFeature)?.name}
            </CardTitle>
          </CardHeader>
          <Separator className="mb-0" />
          <ScrollArea className="h-[calc(100vh-40px)]">
            <CardContent className="p-3 pt-2">
              {features.find(f => f.id === activeFeature)?.component}
            </CardContent>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}

export default LeftMenu
