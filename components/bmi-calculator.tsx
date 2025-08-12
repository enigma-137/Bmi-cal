"use client"

import React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ThemeToggle } from "@/components/theme-toggle"
import {
    Heart,
    Calculator,
    Target,
    Flame,
    Weight,
    ArrowRight,
    ArrowLeft,
    RotateCcw,
    Lightbulb,
    Ruler,
    Scale,
} from "lucide-react"
import GaugeChart from "@/components/gauge-chart"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    age: z.number().min(1, "Age must be at least 1").max(120, "Age must be less than 120"),
    gender: z.string().min(1, "Please select a gender"),
    height: z.number().min(50, "Height must be at least 50cm").max(300, "Height must be less than 300cm"),
    weight: z.number().min(20, "Weight must be at least 20kg").max(500, "Weight must be less than 500kg"),
    activity: z.number().min(1.2).max(1.725),
    heightUnit: z.enum(["cm", "ft"]),
    weightUnit: z.enum(["kg", "lb"]),
})

type FormData = z.infer<typeof formSchema>

interface CalculationResults {
    bmi: number
    bmiCategory: string
    minWeight: number
    maxWeight: number
    bmr: number
    dailyCalories: number
    healthAdvice: string
    heightInCm: number
    weightInKg: number
    proteinGrams: number
    carbsGrams: number
    fatGrams: number
}

const activityLevels = [
    { value: 1.2, label: "Sedentary", description: "Little to no exercise", icon: "🛋️" },
    { value: 1.375, label: "Lightly Active", description: "Light exercise 1-3 days/week", icon: "🚶" },
    { value: 1.55, label: "Moderately Active", description: "Moderate exercise 3-5 days/week", icon: "🏃" },
    { value: 1.725, label: "Very Active", description: "Heavy exercise 6-7 days/week", icon: "🏋️" },
]

export default function BMICalculator() {
    const [currentStep, setCurrentStep] = useState(0)
    const [results, setResults] = useState<CalculationResults | null>(null)

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            age: 25,
            gender: "male",
            height: 170,
            weight: 70,
            activity: 1.55,
            heightUnit: "cm",
            weightUnit: "kg",
        },
    })

    const steps = ["Welcome", "Basic Info", "BMI Results", "Your Results"]

    const convertHeight = (height: number, fromUnit: string, toUnit: string): number => {
        if (fromUnit === toUnit) return height
        if (fromUnit === "ft" && toUnit === "cm") {
            return height * 30.48 // feet to cm
        }
        if (fromUnit === "cm" && toUnit === "ft") {
            return height / 30.48 // cm to feet
        }
        return height
    }

    const convertWeight = (weight: number, fromUnit: string, toUnit: string): number => {
        if (fromUnit === toUnit) return weight
        if (fromUnit === "lb" && toUnit === "kg") {
            return weight * 0.453592 // pounds to kg
        }
        if (fromUnit === "kg" && toUnit === "lb") {
            return weight / 0.453592 // kg to pounds
        }
        return weight
    }

    const formatHeight = (height: number, unit: string): string => {
        if (unit === "ft") {
            const feet = Math.floor(height)
            const inches = Math.round((height - feet) * 12)
            return `${feet}'${inches}"`
        }
        return `${height.toFixed(1)} cm`
    }

    const calculateResults = (data: FormData): CalculationResults => {
        const heightInCm = convertHeight(data.height, data.heightUnit, "cm")
        const weightInKg = convertWeight(data.weight, data.weightUnit, "kg")

        const heightInM = heightInCm / 100
        const bmi = weightInKg / (heightInM * heightInM)

        let bmiCategory: string
        if (bmi < 18.5) bmiCategory = "Underweight"
        else if (bmi < 25) bmiCategory = "Normal Weight"
        else if (bmi < 30) bmiCategory = "Overweight"
        else bmiCategory = "Obese"

        const minWeight = 18.5 * heightInM * heightInM
        const maxWeight = 24.9 * heightInM * heightInM

        // Mifflin-St Jeor equation
        let bmr: number
        if (data.gender === "male") {
            bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * data.age + 5
        } else {
            bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * data.age - 161
        }

        const dailyCalories = bmr * data.activity

        // Macro split: 50% carbs, 30% protein, 20% fat
        const proteinCalories = 0.3 * dailyCalories
        const carbsCalories = 0.5 * dailyCalories
        const fatCalories = 0.2 * dailyCalories

        const proteinGrams = Math.round(proteinCalories / 4)
        const carbsGrams = Math.round(carbsCalories / 4)
        const fatGrams = Math.round(fatCalories / 9)

        const healthAdvice = generateHealthAdvice(data.name, bmi, bmiCategory)

        return {
            bmi: Number.parseFloat(bmi.toFixed(1)),
            bmiCategory,
            minWeight: Number.parseFloat(minWeight.toFixed(1)),
            maxWeight: Number.parseFloat(maxWeight.toFixed(1)),
            bmr: Math.round(bmr),
            dailyCalories: Math.round(dailyCalories),
            healthAdvice,
            heightInCm,
            weightInKg,
            proteinGrams,
            carbsGrams,
            fatGrams,
        }
    }

    const generateHealthAdvice = (name: string, bmi: number, category: string): string => {
        if (bmi < 18.5) {
            return `Hi ${name}! Your BMI indicates you're underweight. Consider consulting with a healthcare provider or nutritionist to develop a healthy weight gain plan. Focus on nutrient-dense foods and consider strength training to build healthy muscle mass.`
        } else if (bmi < 25) {
            return `Great job, ${name}! You're within a healthy BMI range. Keep up your balanced eating habits and regular physical activity. Your calorie needs support maintaining your current healthy weight. Continue monitoring your health with regular check-ups.`
        } else if (bmi < 30) {
            return `Hi ${name}, your BMI indicates you're in the overweight range. Consider making gradual lifestyle changes like increasing physical activity and focusing on portion control. Small, sustainable changes can help you reach a healthier weight over time.`
        } else {
            return `Hi ${name}, your BMI suggests you may benefit from working with healthcare professionals to develop a comprehensive weight management plan. Focus on creating sustainable healthy habits with proper nutrition and regular exercise. Remember, every small step counts!`
        }
    }

    const onSubmit = (data: FormData) => {
        const calculationResults = calculateResults(data)
        setResults(calculationResults)
        setCurrentStep(2)
    }

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const resetCalculator = () => {
        setCurrentStep(0)
        setResults(null)
        form.reset()
    }

    const pageVariants = {
        initial: { opacity: 0, x: 50 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -50 },
    }

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.5,
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* <div className="flex justify-end mb-6">
        <ThemeToggle />
      </div> */}

            {/* Progress Bar */}
            <div className="flex items-center justify-center mb-8">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index <= currentStep
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                }`}
                        >
                            {index + 1}
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`w-16 h-1 mx-2 ${index < currentStep ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="text-center">
                <Badge variant="outline" className="text-sm">
                    Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
                </Badge>
            </div>

            <AnimatePresence mode="wait">
                {/* Welcome Screen */}
                {currentStep === 0 && (
                    <motion.div
                        key="welcome"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                    // transition={pageTransition}
                    >
                        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                            <CardContent className="p-12 text-center">
                                <motion.div
                                    className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                >
                                    <Heart className="text-white text-2xl" />
                                </motion.div>
                                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                                    Welcome to Your Health Journey
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                                    Calculate your BMI and daily calorie needs with support for both metric and imperial units. Get
                                    personalized health insights to help you make informed decisions about your wellness goals.
                                </p>
                                <div className="bg-blue-50 dark:bg-gray-700 rounded-xl p-6 mb-8">
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4">What you'll discover:</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center justify-center">
                                            <Calculator className="text-blue-500 mr-2 h-5 w-5" />
                                            Your BMI score & category
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <Target className="text-blue-500 mr-2 h-5 w-5" />
                                            Healthy weight range
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <Flame className="text-blue-500 mr-2 h-5 w-5" />
                                            Daily calorie needs
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={nextStep}
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl text-lg font-medium"
                                >
                                    Start Your Assessment <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Basic Info Form */}
                {currentStep === 1 && (
                    <motion.div
                        key="form"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                    // transition={pageTransition}
                    >
                        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                            <CardHeader>
                                <CardTitle className="text-2xl text-center text-gray-800 dark:text-white">
                                    Tell Us About Yourself
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    {/* Personal Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium">
                                                Name
                                            </Label>
                                            <Input id="name" placeholder="Enter your name" {...form.register("name")} className="h-12" />
                                            {form.formState.errors.name && (
                                                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="age" className="text-sm font-medium">
                                                Age
                                            </Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                placeholder="25"
                                                {...form.register("age", { valueAsNumber: true })}
                                                className="h-12"
                                            />
                                            {form.formState.errors.age && (
                                                <p className="text-red-500 text-sm">{form.formState.errors.age.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium">Gender</Label>
                                        <RadioGroup
                                            value={form.watch("gender")}
                                            onValueChange={(value) => form.setValue("gender", value as "male" | "female" | "other")}
                                            className="flex gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="male" id="male" />
                                                <Label htmlFor="male">Male</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="female" id="female" />
                                                <Label htmlFor="female">Female</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="other" id="other" />
                                                <Label htmlFor="other">Other</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* Height with Unit Conversion */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium flex items-center">
                                            <Ruler className="mr-2 h-4 w-4" />
                                            Height
                                        </Label>
                                        <Tabs
                                            value={form.watch("heightUnit")}
                                            onValueChange={(value) => {
                                                const currentHeight = form.watch("height")
                                                const currentUnit = form.watch("heightUnit")
                                                const convertedHeight = convertHeight(currentHeight, currentUnit, value)
                                                form.setValue("heightUnit", value as "cm" | "ft")
                                                form.setValue("height", Math.round(convertedHeight * 10) / 10)
                                            }}
                                            className="w-full"
                                        >
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="cm">Centimeters</TabsTrigger>
                                                <TabsTrigger value="ft">Feet</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="cm" className="mt-4">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="170"
                                                    {...form.register("height", { valueAsNumber: true })}
                                                    className="h-12"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">Enter height in centimeters</p>
                                            </TabsContent>
                                            <TabsContent value="ft" className="mt-4">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="5.7"
                                                    {...form.register("height", { valueAsNumber: true })}
                                                    className="h-12"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">Enter height in feet (e.g., 5.7 for 5'7")</p>
                                            </TabsContent>
                                        </Tabs>
                                        {form.formState.errors.height && (
                                            <p className="text-red-500 text-sm">{form.formState.errors.height.message}</p>
                                        )}
                                    </div>

                                    {/* Weight with Unit Conversion */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium flex items-center">
                                            <Scale className="mr-2 h-4 w-4" />
                                            Weight
                                        </Label>
                                        <Tabs
                                            value={form.watch("weightUnit")}
                                            onValueChange={(value) => {
                                                const currentWeight = form.watch("weight")
                                                const currentUnit = form.watch("weightUnit")
                                                const convertedWeight = convertWeight(currentWeight, currentUnit, value)
                                                form.setValue("weightUnit", value as "kg" | "lb")
                                                form.setValue("weight", Math.round(convertedWeight * 10) / 10)
                                            }}
                                            className="w-full"
                                        >
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="kg">Kilograms</TabsTrigger>
                                                <TabsTrigger value="lb">Pounds</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="kg" className="mt-4">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="70"
                                                    {...form.register("weight", { valueAsNumber: true })}
                                                    className="h-12"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">Enter weight in kilograms</p>
                                            </TabsContent>
                                            <TabsContent value="lb" className="mt-4">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="154"
                                                    {...form.register("weight", { valueAsNumber: true })}
                                                    className="h-12"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">Enter weight in pounds</p>
                                            </TabsContent>
                                        </Tabs>
                                        {form.formState.errors.weight && (
                                            <p className="text-red-500 text-sm">{form.formState.errors.weight.message}</p>
                                        )}
                                    </div>

                                    {/* Activity Level */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium">Activity Level</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activityLevels.map((level) => (
                                                <div
                                                    key={level.value}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${form.watch("activity") === level.value
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                                                        }`}
                                                    onClick={() => form.setValue("activity", level.value)}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-2xl">{level.icon}</span>
                                                        <div>
                                                            <div className="font-medium text-gray-800 dark:text-white">{level.label}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-300">{level.description}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-6">
                                        <Button
                                            type="button"
                                            onClick={prevStep}
                                            variant="outline"
                                            size="lg"
                                            className="px-8 bg-transparent"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 px-8"
                                        >
                                            Calculate BMI <Calculator className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* BMI Results Screen */}
                {currentStep === 2 && results && (
                    <motion.div
                        key="bmi"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                    // transition={pageTransition}
                    >
                        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                            <CardHeader>
                                <CardTitle className="text-3xl text-center text-gray-800 dark:text-white">Your BMI Results</CardTitle>
                                <p className="text-center text-gray-600 dark:text-gray-300">
                                    Here's your Body Mass Index and what it means for your health.
                                </p>
                            </CardHeader>
                            <CardContent className="p-8">
                                {/* BMI Gauge Chart */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 mb-8">
                                    <div className="text-center mb-6">
                                        <div className="text-5xl font-bold text-gray-800 dark:text-white mb-2">{results.bmi}</div>
                                        <Badge
                                            variant={results.bmiCategory === "Normal Weight" ? "default" : "secondary"}
                                            className="text-lg px-4 py-1"
                                        >
                                            {results.bmiCategory}
                                        </Badge>
                                    </div>

                                    <GaugeChart value={results.bmi} />
                                </div>

                                {/* Healthy Weight Range */}
                                <div className="bg-blue-50 dark:bg-gray-700 rounded-xl p-6 mb-8">
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4 text-center">
                                        Healthy Weight Range for Your Height
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {results.minWeight.toFixed(1)}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Minimum (kg)</div>
                                        </div>
                                        <div className="flex-1 mx-4">
                                            <div className="h-3 bg-blue-200 dark:bg-gray-600 rounded-full">
                                                <div
                                                    className="h-3 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full"
                                                    style={{
                                                        width: "60%",
                                                        marginLeft: "20%",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {results.maxWeight.toFixed(1)}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Maximum (kg)</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button onClick={prevStep} variant="outline" size="lg" className="px-8 bg-transparent">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button
                                        onClick={nextStep}
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 px-8"
                                    >
                                        View Full Results <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Complete Results Screen */}
                {currentStep === 3 && results && (
                    <motion.div
                        key="results"
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                    // transition={pageTransition}
                    >
                        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                            <CardHeader>
                                <CardTitle className="text-3xl text-center text-gray-800 dark:text-white">
                                    Complete Health Analysis
                                </CardTitle>
                                <p className="text-center text-gray-600 dark:text-gray-300">
                                    Here's everything you need to know about your health metrics and recommendations.
                                </p>
                            </CardHeader>
                            <CardContent className="p-8">
                                {/* Results Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                                        <div className="flex items-center mb-4">
                                            <Weight className="text-2xl mr-3" />
                                            <h3 className="text-lg font-semibold">Body Mass Index</h3>
                                        </div>
                                        <div className="text-3xl font-bold mb-2">{results.bmi}</div>
                                        <div className="opacity-90">{results.bmiCategory}</div>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
  {/* Title */}
  <div className="flex items-center mb-4">
    <Flame className="text-2xl mr-3" />
    <h3 className="text-lg font-semibold">Daily Calories</h3>
  </div>

  {/* Calories */}
  <div className="text-4xl font-bold mb-1">{results.dailyCalories.toLocaleString()}</div>
  <div className="text-sm opacity-90 mb-4">Calories per day</div>

  {/* Macros */}
  <div className="flex justify-between">
    {/* Protein */}
    <div className="flex flex-col items-center">
      <span className="text-base font-bold">{results.proteinGrams.toLocaleString()}g</span>
      <span className="text-xs font-medium">Protein</span>
    </div>

    {/* Carbs */}
    <div className="flex flex-col items-center">
      <span className="text-base font-bold">{results.carbsGrams.toLocaleString()}g</span>
      <span className="text-xs font-medium">Carbs</span>
    </div>

    {/* Fat */}
    <div className="flex flex-col items-center">
      <span className="text-base font-bold">{results.fatGrams.toLocaleString()}g</span>
      <span className="text-xs font-medium">Fat</span>
    </div>
  </div>
</div>

                                </div>



                                {/* Health Advice */}
                                <div className="bg-amber-50 dark:bg-gray-700 rounded-xl p-6 mb-8 border border-amber-200 dark:border-gray-600">
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                        <Lightbulb className="text-amber-500 mr-2" />
                                        Personalized Health Advice
                                    </h3>
                                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{results.healthAdvice}</div>
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div className="text-center p-4 bg-blue-50 dark:bg-gray-700 rounded-xl">
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">BMR (Base Rate)</div>
                                        <div className="text-lg font-semibold text-gray-800 dark:text-white">
                                            {results.bmr.toLocaleString()} cal/day
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 dark:bg-gray-700 rounded-xl">
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Healthy Weight Range</div>
                                        <div className="text-lg font-semibold text-gray-800 dark:text-white">
                                            {results.minWeight.toFixed(1)} - {results.maxWeight.toFixed(1)} kg
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 dark:bg-gray-700 rounded-xl">
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Measurements</div>
                                        <div className="text-lg font-semibold text-gray-800 dark:text-white">
                                            {results.heightInCm.toFixed(0)}cm, {results.weightInKg.toFixed(1)}kg
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button onClick={prevStep} variant="outline" size="lg" className="px-8 bg-transparent">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to BMI
                                    </Button>
                                    <Button
                                        onClick={resetCalculator}
                                        size="lg"
                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8"
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" /> New Calculation
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}