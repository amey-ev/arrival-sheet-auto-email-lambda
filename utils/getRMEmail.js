const getRMEmail = (employeeId, resourceDetailsResponse) => {
  if (
    Object.hasOwn(resourceDetailsResponse, 'resource_details') &&
    resourceDetailsResponse.resource_details.length
  ) {
    const obtainedResourceObject =
      resourceDetailsResponse.resource_details.find(
        (element) => element.employeeId === employeeId
      );
    return obtainedResourceObject?.manager?.email || '-';
  }
};

module.exports = getRMEmail;
