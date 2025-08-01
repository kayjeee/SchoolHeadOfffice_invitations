import React, { useState, useEffect } from 'react';
import { FiMail, FiMessageSquare, FiSmartphone, FiCheckCircle, FiDollarSign, FiTrendingUp, FiUsers, FiZap, FiClock, FiStar, FiShield, FiGlobe, FiHeart } from 'react-icons/fi';

/**
 * Enhanced ChannelSelector Component
 * 
 * Professional channel selection with WhatsApp prioritization, real-time cost analysis,
 * and compelling value propositions designed for maximum conversion.
 */
const ChannelSelector = ({ 
  selectedChannels = [], 
  onChange, 
  user = {},
  selectedSchool = {},
  costAnalysis = {},
  pricing = {},
  recipientCount = 0
}) => {
  const [hoveredChannel, setHoveredChannel] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  
  const channels = [
    { 
      id: 'whatsapp', 
      name: 'WhatsApp Business', 
      icon: FiMessageSquare, 
      recommended: true,
      priority: 1,
      description: '🚀 Instant delivery • 98% open rate • 100% FREE messaging',
      tagline: 'The Smart Choice',
      valueProps: [
        'Zero cost per message - save up to R500+ monthly',
        'Highest engagement rate (98% vs 85% email)',
        'Rich media support - images, documents, voice notes',
        'Two-way conversations - parents can reply instantly',
        'Read receipts - know when messages are seen',
        'No character limits - unlimited message length'
      ],
      features: ['Free Forever', 'Instant Delivery', 'Rich Media', 'Two-way Chat'],
      color: 'green',
      cost: 0,
      engagement: 98,
      deliveryTime: 'Instant',
      reliability: 99.9,
      badge: 'FREE',
      badgeColor: 'green',
      gradient: 'from-green-400 to-green-600',
      savings: 'Save R8.50 per 100 messages vs SMS'
    },
    { 
      id: 'sms', 
      name: 'SMS Professional', 
      icon: FiSmartphone, 
      recommended: false,
      priority: 2,
      description: '📱 Universal reach • 94% open rate • Premium delivery',
      tagline: 'Universal Compatibility',
      valueProps: [
        'Works on every mobile phone - no smartphone required',
        'Reliable delivery even with poor internet',
        'Professional appearance and formatting',
        'Immediate notification sound alerts',
        'Works in all network conditions',
        'Trusted by parents worldwide'
      ],
      features: ['Universal Access', 'No Internet Required', 'Instant Alerts', 'Professional'],
      color: 'blue',
      cost: pricing.sms?.standard || 0.085,
      engagement: 94,
      deliveryTime: '<30sec',
      reliability: 99.5,
      badge: `R${(pricing.sms?.standard || 0.085).toFixed(3)} per msg`,
      badgeColor: 'blue',
      gradient: 'from-blue-400 to-blue-600',
      savings: null
    },
    { 
      id: 'email', 
      name: 'Email Professional', 
      icon: FiMail, 
      recommended: false,
      priority: 3,
      description: '✉️ Rich content • 85% open rate • Professional branding',
      tagline: 'Detailed Communication',
      valueProps: [
        'Detailed messaging with rich formatting',
        'Unlimited attachment support (PDFs, images)',
        'Professional email templates and branding',
        'Easy forwarding and archiving',
        'Desktop and mobile accessible',
        'Spam filter protection built-in'
      ],
      features: ['Rich Content', 'Attachments', 'Professional', 'Archivable'],
      color: 'purple',
      cost: pricing.email?.standard || 0.045,
      engagement: 85,
      deliveryTime: '<5min',
      reliability: 98.5,
      badge: `R${(pricing.email?.standard || 0.045).toFixed(3)} per msg`,
      badgeColor: 'purple',
      gradient: 'from-purple-400 to-purple-600',
      savings: null
    }
  ];

  // Calculate real-time costs and savings
  const calculateChannelCost = (channel) => {
    if (channel.id === 'whatsapp') return 0;
    return channel.cost * recipientCount;
  };

  const calculateSavings = () => {
    if (!selectedChannels.includes('whatsapp')) return 0;
    const smsChannel = channels.find(c => c.id === 'sms');
    const emailChannel = channels.find(c => c.id === 'email');
    
    let savings = 0;
    if (selectedChannels.includes('sms')) {
      savings += smsChannel.cost * recipientCount;
    }
    if (selectedChannels.includes('email')) {
      savings += emailChannel.cost * recipientCount;
    }
    
    return savings;
  };

  const totalCost = selectedChannels.reduce((sum, channelId) => {
    const channel = channels.find(c => c.id === channelId);
    return sum + calculateChannelCost(channel);
  }, 0);

  const totalSavings = calculateSavings();

  const handleChannelToggle = (channelId) => {
    let newChannels;
    
    if (selectedChannels.includes(channelId)) {
      // Removing a channel
      newChannels = selectedChannels.filter(id => id !== channelId);
    } else {
      // Adding a channel
      newChannels = [...selectedChannels, channelId];
    }
    
    if (typeof onChange === 'function') {
      onChange(newChannels);
    }
  };

  const getChannelCardStyle = (channel) => {
    const isSelected = selectedChannels.includes(channel.id);
    const isHovered = hoveredChannel === channel.id;
    
    if (isSelected) {
      return `border-2 bg-gradient-to-br from-white to-${channel.color}-50 border-${channel.color}-400 ring-4 ring-${channel.color}-200 shadow-xl transform scale-105`;
    }
    
    if (isHovered) {
      return `border-2 border-${channel.color}-300 bg-gradient-to-br from-white to-${channel.color}-25 shadow-lg transform scale-102`;
    }
    
    return 'border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200';
  };

  const getBadgeStyle = (channel) => {
    const colors = {
      green: 'bg-gradient-to-r from-green-400 to-green-600 text-white',
      blue: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white',
      purple: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white'
    };
    return colors[channel.badgeColor] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              📡 Communication Channels
              {selectedChannels.includes('whatsapp') && (
                <span className="ml-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  SMART CHOICE!
                </span>
              )}
            </h2>
            <p className="text-blue-100 text-lg">
              Choose your delivery methods for maximum reach and cost efficiency
            </p>
          </div>
          
          {selectedChannels.length > 0 && (
            <div className="text-right bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-xl font-bold">
                R{totalCost.toFixed(2)}
              </div>
              <div className="text-sm text-blue-100">
                Total cost for {recipientCount} recipients
              </div>
              {totalSavings > 0 && (
                <div className="text-green-300 text-sm font-bold mt-1">
                  💰 Saving R{totalSavings.toFixed(2)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Priority Banner */}
      {!selectedChannels.includes('whatsapp') && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 shadow-2xl border-2 border-green-400">
          <div className="flex items-center justify-between text-white">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center">
                💡 Maximize Your Impact with WhatsApp
                <FiStar className="ml-2 text-yellow-300" />
              </h3>
              <p className="text-green-100 mb-4">Join 98% of schools that choose WhatsApp for the highest engagement</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <FiCheckCircle className="mr-2" />
                  Completely FREE messaging
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="mr-2" />
                  98% engagement rate
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="mr-2" />
                  Instant delivery
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="mr-2" />
                  Rich media support
                </div>
              </div>
            </div>
            <button
              onClick={() => handleChannelToggle('whatsapp')}
              className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transform hover:scale-105 transition-all shadow-xl"
            >
              Choose WhatsApp FREE
            </button>
          </div>
        </div>
      )}

      {/* Channel Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {channels.sort((a, b) => a.priority - b.priority).map(channel => {
          const IconComponent = channel.icon;
          const isSelected = selectedChannels.includes(channel.id);
          const channelCost = calculateChannelCost(channel);
          
          return (
            <div
              key={channel.id}
              className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 ${getChannelCardStyle(channel)}`}
              onClick={() => handleChannelToggle(channel.id)}
              onMouseEnter={() => setHoveredChannel(channel.id)}
              onMouseLeave={() => setHoveredChannel(null)}
            >
              {/* Priority Badges */}
              {channel.recommended && (
                <div className={`absolute -top-3 -right-3 bg-gradient-to-r ${channel.gradient} text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-10`}>
                  ⭐ RECOMMENDED
                </div>
              )}

              {channel.id === 'whatsapp' && (
                <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                  #1 CHOICE
                </div>
              )}

              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${channel.gradient} shadow-lg`}>
                      <IconComponent className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{channel.name}</h3>
                      <p className="text-sm text-gray-600">{channel.tagline}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleChannelToggle(channel.id)}
                      className={`rounded-lg border-2 h-6 w-6 text-${channel.color}-600 focus:ring-${channel.color}-500 focus:ring-2`}
                    />
                  </div>
                </div>

                {/* Cost Badge */}
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg ${getBadgeStyle(channel)}`}>
                  {channel.badge}
                  {channel.id === 'whatsapp' && <FiHeart className="ml-2 h-4 w-4" />}
                </div>

                {/* Description */}
                <p className="text-gray-700 font-medium">
                  {channel.description}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="font-bold text-lg text-gray-900">{channel.engagement}%</div>
                    <div className="text-gray-500 text-xs">Open Rate</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="font-bold text-lg text-gray-900">{channel.deliveryTime}</div>
                    <div className="text-gray-500 text-xs">Delivery</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="font-bold text-lg text-gray-900">{channel.reliability}%</div>
                    <div className="text-gray-500 text-xs">Reliable</div>
                  </div>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2">
                  {channel.features.map((feature, index) => (
                    <span
                      key={index}
                      className={`text-xs px-2 py-1 rounded-full bg-${channel.color}-100 text-${channel.color}-800 font-medium`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Cost Information */}
                {isSelected && (
                  <div className="space-y-3">
                    {channelCost > 0 ? (
                      <div className="bg-white bg-opacity-80 rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm">
                            <FiDollarSign className="mr-2 h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Campaign cost:</span>
                          </div>
                          <div className="font-bold text-lg text-gray-900">
                            R{channelCost.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          R{channel.cost.toFixed(3)} × {recipientCount} recipients
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center text-green-700">
                          <FiTrendingUp className="mr-2 h-5 w-5" />
                          <div>
                            <div className="font-bold">FREE for {recipientCount} recipients!</div>
                            <div className="text-sm">
                              You're saving R{(channels.find(c => c.id === 'sms')?.cost * recipientCount || 0).toFixed(2)} vs SMS
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Value Propositions (on hover/select) */}
                {(isSelected || hoveredChannel === channel.id) && (
                  <div className="space-y-2 bg-gray-50 rounded-xl p-4">
                    <h5 className="font-bold text-gray-900 text-sm">Why choose {channel.name}?</h5>
                    {channel.valueProps.slice(0, 3).map((prop, index) => (
                      <div key={index} className="flex items-start text-xs text-gray-700">
                        <FiCheckCircle className={`mr-2 h-3 w-3 text-${channel.color}-500 flex-shrink-0 mt-0.5`} />
                        <span>{prop}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Feedback */}
      {selectedChannels.length === 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <FiZap className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-amber-800">
                Select at least one channel to continue
              </h3>
              <p className="mt-2 text-amber-700">
                💡 <strong>Pro tip:</strong> WhatsApp delivers the highest engagement at zero cost - it's the smart choice for schools!
              </p>
              <button
                onClick={() => handleChannelToggle('whatsapp')}
                className="mt-3 bg-green-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-600 transition-colors"
              >
                Choose WhatsApp (FREE)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-channel Success Message */}
      {selectedChannels.length > 1 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiTrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-blue-800">
                🎯 Excellent strategy! Multi-channel approach increases success rates by 40%
              </h3>
              <p className="mt-2 text-blue-700">
                Your messages will reach parents via: {selectedChannels.map(id => {
                  const channel = channels.find(c => c.id === id);
                  return channel?.name;
                }).filter(Boolean).join(', ')}
              </p>
              {selectedChannels.includes('whatsapp') && (
                <div className="mt-2 flex items-center text-green-700">
                  <FiCheckCircle className="mr-2 h-4 w-4" />
                  <span className="font-medium">Smart! You've included WhatsApp for maximum engagement</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Success Message */}
      {selectedChannels.includes('whatsapp') && selectedChannels.length === 1 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiHeart className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-green-800">
                🎉 Perfect choice! WhatsApp is the #1 channel for school communication
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-green-700">
                <div className="flex items-center">
                  <FiCheckCircle className="mr-2 h-4 w-4" />
                  <span>98% engagement rate</span>
                </div>
                <div className="flex items-center">
                  <FiDollarSign className="mr-2 h-4 w-4" />
                  <span>R0.00 cost (FREE forever)</span>
                </div>
                <div className="flex items-center">
                  <FiZap className="mr-2 h-4 w-4" />
                  <span>Instant delivery</span>
                </div>
                <div className="flex items-center">
                  <FiUsers className="mr-2 h-4 w-4" />
                  <span>Preferred by 98% of parents</span>
                </div>
              </div>
              <p className="mt-3 text-green-600 font-medium">
                💰 You're saving R{(channels.find(c => c.id === 'sms')?.cost * recipientCount || 0).toFixed(2)} compared to SMS!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cost Comparison Toggle */}
      {selectedChannels.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all"
          >
            <FiDollarSign className="mr-2 h-4 w-4" />
            {showComparison ? 'Hide' : 'Show'} Cost Comparison
          </button>
        </div>
      )}

      {/* Detailed Cost Comparison */}
      {showComparison && (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            💰 Cost Breakdown for {recipientCount} Recipients
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-900">Channel</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-900">Per Message</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-900">Total Cost</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-900">Engagement</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {channels.map(channel => {
                  const isSelected = selectedChannels.includes(channel.id);
                  const totalCost = calculateChannelCost(channel);
                  const IconComponent = channel.icon;
                  
                  return (
                    <tr key={channel.id} className={`border-b border-gray-100 ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-5 w-5 text-${channel.color}-600`} />
                          <div>
                            <div className="font-medium text-gray-900">{channel.name}</div>
                            {channel.id === 'whatsapp' && (
                              <div className="text-xs text-green-600 font-bold">RECOMMENDED</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className={`font-bold ${channel.id === 'whatsapp' ? 'text-green-600' : 'text-gray-900'}`}>
                          {channel.id === 'whatsapp' ? 'FREE' : `R${channel.cost.toFixed(3)}`}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className={`font-bold text-lg ${channel.id === 'whatsapp' ? 'text-green-600' : 'text-gray-900'}`}>
                          {channel.id === 'whatsapp' ? 'R0.00' : `R${totalCost.toFixed(2)}`}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className={`font-bold ${channel.engagement >= 95 ? 'text-green-600' : channel.engagement >= 90 ? 'text-blue-600' : 'text-yellow-600'}`}>
                          {channel.engagement}%
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        {isSelected ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                            ✓ Selected
                          </span>
                        ) : (
                          <button
                            onClick={() => handleChannelToggle(channel.id)}
                            className={`bg-${channel.color}-100 text-${channel.color}-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-${channel.color}-200 transition-colors`}
                          >
                            Select
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">R{totalCost.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Selected Cost</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">R{totalSavings.toFixed(2)}</div>
                <div className="text-sm text-gray-600">WhatsApp Savings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {selectedChannels.length > 0 
                    ? Math.round(selectedChannels.reduce((sum, id) => {
                        const channel = channels.find(c => c.id === id);
                        return sum + channel.engagement;
                      }, 0) / selectedChannels.length)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Avg. Engagement</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      {!selectedChannels.includes('whatsapp') && selectedChannels.length > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-center text-white">
          <h3 className="text-xl font-bold mb-2">💡 Want to save even more?</h3>
          <p className="mb-4">Add WhatsApp to your selection and get FREE messaging with 98% engagement!</p>
          <button
            onClick={() => handleChannelToggle('whatsapp')}
            className="bg-white text-green-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-green-50 transform hover:scale-105 transition-all shadow-lg"
          >
            Add WhatsApp FREE
          </button>
        </div>
      )}
    </div>
  );
};

export default ChannelSelector;