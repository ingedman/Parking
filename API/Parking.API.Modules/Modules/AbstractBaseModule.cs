﻿using System;

using System.Web;
using System.Linq;
using System.Reflection;
using System.Collections.Generic;

using Nancy;
using Nancy.ViewEngines.Razor;
using Nancy.Serializers.Json;
using System.Text.RegularExpressions;

namespace Sieena.Parking.API.Modules
{
    /// <summary>
    /// Autoregisters the API Methods based on the attributes
    /// </summary>
    public abstract class AbstractBaseModule : NancyModule
    {
        public AbstractBaseModule(string modulePath)
            : base(modulePath)
        {
            Get["/"] = parameters =>
            {
                Type t = this.GetType();

                List<string> methods = t.GetMethods()
                                        .Where(mi => {
                                            return mi.GetCustomAttributes(typeof(ApiAttribute), true).Any();
                                        })
                                        .Select(mi => mi.Name)
                                        .ToList();

                // Get available public methods to display.
                return Envelope(methods);
            };

            Get["/ping"] = parameters =>
            {
                return Envelope("pong");
            };

            this.RegisterAPIMethods();
        }

        /// <summary>
        /// Registers the API Methods
        /// </summary>
        private void RegisterAPIMethods()
        {
            Type t = this.GetType();
            t.GetMethods()
             .Where(mi =>
             {
                return mi.GetCustomAttributes(typeof(ApiAttribute), true).Any();
             })
             .ToList()
             .ForEach( mi => {
                ApiAttribute tag = mi.GetCustomAttributes(typeof(ApiAttribute), true).First() as ApiAttribute;

                string route = tag.GetRoute();
                switch (tag.GetMethod())
                {
                    case ApiMethod.GET:
                        Get[route] = parameters => mi.Invoke(this, new object[] { parameters }) as Response;
                        break;
                    case ApiMethod.POST:
                        Post[route] = parameters => mi.Invoke(this, new object[] { parameters }) as Response;
                        break;
                    case ApiMethod.PUT:
                        Put[route] = parameters => mi.Invoke(this, new object[] { parameters }) as Response;
                        break;
                    case ApiMethod.DELETE:
                        Delete[route] = parameters => mi.Invoke(this, new object[] { parameters }) as Response;
                        break;
                    case ApiMethod.GETPOST: 
                        Get[route] = parameters => mi.Invoke(this, new object[] { parameters }) as Response;
                        Post[route] = parameters => mi.Invoke(this, new object[] { parameters }) as Response;
                        break;
                }
             });
                                        
        }


        /// <summary>
        /// Wraps the data that will be returned into a standard message with additional fixed data.
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        protected Response Envelope(dynamic data)
        {
            string type = string.Empty;
            try
            {
                Type t = data.GetType();
                type = t.Name;

                if (t.IsGenericType)
                {
                
                    type = t.GetGenericArguments()[0].Name;
                }
                
            }
            catch (Exception e)
            {
                data = e;
            }

            return Response.AsJson(new {
                Time = ConvertToUnixTime(DateTime.Now),
                Response = data,
                Type = type,
                Error = false, 
            });
        }

        /// <summary>
        /// Converts a datetime to unixtime.
        /// </summary>
        /// <param name="date"></param>
        /// <returns></returns>
        protected double ConvertToUnixTime(DateTime date)
        {
            DateTime origin = new DateTime(1970, 1, 1, 0, 0, 0, 0);
            TimeSpan diff = date - origin;
            return Math.Floor(diff.TotalSeconds);
        }
    }
}