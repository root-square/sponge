﻿using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Data;

namespace Sponge.Converters
{
    /// <summary>
    /// Provides a converter that reverses the boolean value.
    /// </summary>
    [ValueConversion(typeof(bool), typeof(bool?))]
    public class BooleanConverter : IValueConverter
    {
        public object? Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if ((bool?)value == null)
            {
                return null;
            }
            else
            {
                return !(bool?)value;
            }
        }

        public object? ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if ((bool?)value == null)
            {
                return null;
            }
            else
            {
                return !(bool)value;
            }
        }
    }
}
