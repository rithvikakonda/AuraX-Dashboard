import React from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { setSelectedTemplate } from '@/redux/features/studioSlice'
import { useAppDispatch, useAppSelector } from "@/redux/hooks"

const Templates = () => {
  const dispatch = useAppDispatch()
  const { templates } = useAppSelector((state) => state.studio)
  
  return (
    <div className="w-72 p-4">
      <h3 className="font-medium text-md mb-4">Templates</h3>

      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
        {templates.map((template) => (
          <Card
            key={template.name}
            className="relative h-28 overflow-hidden cursor-pointer group"
            onClick={() => dispatch(setSelectedTemplate(template))}
          >
            {/* Template preview image */}
            <div className="absolute inset-0">
              <Image
                src={template.imageUrl}
                alt={template.name}
                fill
                sizes="100%"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={false}
              />

              {/* Dark overlay that appears on hover */}
              <div className="absolute inset-0 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Template name */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-white text-xs font-medium">{template.name}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Templates
